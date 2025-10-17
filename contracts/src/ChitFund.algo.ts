import { Contract } from '@algorandfoundation/tealscript';

// Member structure
type Member = {
  address: Address;
  contributed: uint64;
  hasReceivedPot: boolean;
  lastContributionMonth: uint64;
};

// Bid structure
type Bid = {
  bidder: Address;
  discountPercentage: uint64;
  timestamp: uint64;
};

export class ChitFundContract extends Contract {
  // State variables
  manager = GlobalStateKey<Address>();
  monthlyContribution = GlobalStateKey<uint64>();
  managerCommissionPercent = GlobalStateKey<uint64>();
  totalMembers = GlobalStateKey<uint64>();
  currentMonth = GlobalStateKey<uint64>();
  chitValue = GlobalStateKey<uint64>();
  isActive = GlobalStateKey<boolean>();

  // Box storage for members and bids
  members = BoxMap<Address, Member>();
  currentBids = BoxMap<Address, Bid>();

  // Initialize the chit fund
  createApplication(
    monthlyContrib: uint64,
    commissionPercent: uint64,
    totalMembersCount: uint64
  ): void {
    this.manager.value = this.txn.sender;
    this.monthlyContribution.value = monthlyContrib;
    this.managerCommissionPercent.value = commissionPercent;
    this.totalMembers.value = totalMembersCount;
    this.currentMonth.value = 0;
    this.chitValue.value = monthlyContrib * totalMembersCount;
    this.isActive.value = false;
  }

  // Add a member to the chit fund
  addMember(memberAddress: Address): void {
    assert(this.txn.sender === this.manager.value, 'Only manager can add members');
    assert(!this.isActive.value, 'Cannot add members after chit has started');

    const member: Member = {
      address: memberAddress,
      contributed: 0,
      hasReceivedPot: false,
      lastContributionMonth: 0,
    };

    this.members(memberAddress).value = member;
  }

  // Start the chit fund cycle
  startChit(): void {
    assert(this.txn.sender === this.manager.value, 'Only manager can start chit');
    assert(!this.isActive.value, 'Chit already active');

    this.isActive.value = true;
    this.currentMonth.value = 1;
  }

  // Member makes monthly contribution
  contribute(): void {
    assert(this.isActive.value, 'Chit fund not active');

    const member = this.members(this.txn.sender).value;
    assert(member.address === this.txn.sender, 'Not a registered member');
    assert(member.lastContributionMonth < this.currentMonth.value, 'Already contributed this month');

    // Payment transaction verification
    assert(this.txn.sender === this.txn.sender, 'Invalid sender');
    verifyPayTxn(this.txnGroup[this.txn.groupIndex - 1], {
      receiver: this.app.address,
      amount: this.monthlyContribution.value,
    });

    member.contributed = member.contributed + this.monthlyContribution.value;
    member.lastContributionMonth = this.currentMonth.value;

    this.members(this.txn.sender).value = member;
  }

  // Submit a bid for the current month's pot
  submitBid(discountPercent: uint64): void {
    assert(this.isActive.value, 'Chit fund not active');

    const member = this.members(this.txn.sender).value;
    assert(member.address === this.txn.sender, 'Not a registered member');
    assert(!member.hasReceivedPot, 'Already received pot');
    assert(member.lastContributionMonth === this.currentMonth.value, 'Must contribute before bidding');
    assert(discountPercent <= 30, 'Discount cannot exceed 30%');

    const bid: Bid = {
      bidder: this.txn.sender,
      discountPercentage: discountPercent,
      timestamp: globals.latestTimestamp,
    };

    this.currentBids(this.txn.sender).value = bid;
  }

  // Manager selects the lowest bid and distributes pot
  selectWinnerAndDistribute(winnerAddress: Address): void {
    assert(this.txn.sender === this.manager.value, 'Only manager can select winner');
    assert(this.isActive.value, 'Chit fund not active');

    const winner = this.members(winnerAddress).value;
    assert(winner.address === winnerAddress, 'Invalid winner address');
    assert(!winner.hasReceivedPot, 'Winner already received pot');

    const winningBid = this.currentBids(winnerAddress).value;
    assert(winningBid.bidder === winnerAddress, 'No bid from winner');

    // Calculate payout
    const discountAmount = (this.chitValue.value * winningBid.discountPercentage) / 100;
    const potAfterDiscount = this.chitValue.value - discountAmount;

    // Calculate manager commission
    const commission = (discountAmount * this.managerCommissionPercent.value) / 100;
    const remainingDiscount = discountAmount - commission;

    // Transfer pot to winner
    sendPayment({
      receiver: winnerAddress,
      amount: potAfterDiscount,
    });

    // Transfer commission to manager
    if (commission > 0) {
      sendPayment({
        receiver: this.manager.value,
        amount: commission,
      });
    }

    // Mark winner as having received pot
    winner.hasReceivedPot = true;
    this.members(winnerAddress).value = winner;

    // Clear current bids
    this.clearBids();

    // Move to next month
    this.currentMonth.value = this.currentMonth.value + 1;

    // Check if chit cycle is complete
    if (this.currentMonth.value > this.totalMembers.value) {
      this.isActive.value = false;
    }
  }

  // Clear all bids for the current month
  private clearBids(): void {
    // In production, iterate through all bid box keys and delete
    // For now, this is a placeholder - actual implementation would require
    // tracking bid addresses separately
  }

  // Get member details
  getMemberDetails(memberAddress: Address): Member {
    return this.members(memberAddress).value;
  }

  // Get current month
  getCurrentMonth(): uint64 {
    return this.currentMonth.value;
  }

  // Get chit status
  getChitStatus(): boolean {
    return this.isActive.value;
  }

  // Emergency pause (only manager)
  pauseChit(): void {
    assert(this.txn.sender === this.manager.value, 'Only manager can pause');
    this.isActive.value = false;
  }

  // Resume chit (only manager)
  resumeChit(): void {
    assert(this.txn.sender === this.manager.value, 'Only manager can resume');
    this.isActive.value = true;
  }
}
