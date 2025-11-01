import { Contract } from '@algorandfoundation/tealscript';
type Member = {
  address: Address;
  contributed: uint64;
  hasReceivedPot: boolean;
  lastContributionMonth: uint64;
};
type Bid = {
  bidder: Address;
  discountPercentage: uint64;
  timestamp: uint64;
};
export class ChitFundContract extends Contract {
  manager = GlobalStateKey<Address>();
  monthlyContribution = GlobalStateKey<uint64>();
  managerCommissionPercent = GlobalStateKey<uint64>();
  totalMembers = GlobalStateKey<uint64>();
  currentMonth = GlobalStateKey<uint64>();
  chitValue = GlobalStateKey<uint64>();
  isActive = GlobalStateKey<boolean>();
  members = BoxMap<Address, Member>({
    prefix: 'm'
  });
  currentBids = BoxMap<Address, Bid>({
    prefix: 'b'
  });
  createApplication(monthlyContrib: uint64, commissionPercent: uint64, totalMembersCount: uint64): void {
    this.manager.value = this.txn.sender;
    this.monthlyContribution.value = monthlyContrib;
    this.managerCommissionPercent.value = commissionPercent;
    this.totalMembers.value = totalMembersCount;
    this.currentMonth.value = 0;
    this.chitValue.value = monthlyContrib * totalMembersCount;
    this.isActive.value = false;
  }
  addMember(memberAddress: Address): void {
    assert(this.txn.sender === this.manager.value, 'Only manager can add members');
    assert(!this.isActive.value, 'Cannot add members after chit has started');
    const member: Member = {
      address: memberAddress,
      contributed: 0,
      hasReceivedPot: false,
      lastContributionMonth: 0
    };
    this.members(memberAddress).value = member;
  }

  removeMember(memberAddress: Address): void {
    assert(this.txn.sender === this.manager.value, 'Only manager can remove members');
    assert(!this.isActive.value, 'Cannot remove members after chit has started');
    assert(this.members(memberAddress).exists, 'Member does not exist');
    this.members(memberAddress).delete();
    if (this.currentBids(memberAddress).exists) {
      this.currentBids(memberAddress).delete();
    }
  }

  startChit(): void {
    assert(this.txn.sender === this.manager.value, 'Only manager can start chit');
    assert(!this.isActive.value, 'Chit already active');
    this.isActive.value = true;
    this.currentMonth.value = 1;
  }
  contribute(): void {
    assert(this.isActive.value, 'Chit fund not active');
    const member = this.members(this.txn.sender).value;
    assert(member.address === this.txn.sender, 'Not a registered member');
    assert(member.lastContributionMonth < this.currentMonth.value, 'Already contributed this month');
    assert(this.txn.sender === this.txn.sender, 'Invalid sender');
    verifyPayTxn(this.txnGroup[this.txn.groupIndex - 1], {
      receiver: this.app.address,
      amount: this.monthlyContribution.value
    });
    member.contributed = member.contributed + this.monthlyContribution.value;
    member.lastContributionMonth = this.currentMonth.value;
    this.members(this.txn.sender).value = member;
  }
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
      timestamp: globals.latestTimestamp
    };
    this.currentBids(this.txn.sender).value = bid;
  }
  selectWinnerAndDistribute(winnerAddress: Address): void {
    assert(this.txn.sender === this.manager.value, 'Only manager can select winner');
    assert(this.isActive.value, 'Chit fund not active');
    const winner = this.members(winnerAddress).value;
    assert(winner.address === winnerAddress, 'Invalid winner address');
    assert(!winner.hasReceivedPot, 'Winner already received pot');
    const winningBid = this.currentBids(winnerAddress).value;
    assert(winningBid.bidder === winnerAddress, 'No bid from winner');
    const discountAmount = this.chitValue.value * winningBid.discountPercentage / 100;
    const potAfterDiscount = this.chitValue.value - discountAmount;
    const commission = discountAmount * this.managerCommissionPercent.value / 100;
    const remainingDiscount = discountAmount - commission;
    sendPayment({
      receiver: winnerAddress,
      amount: potAfterDiscount
    });
    if (commission > 0) {
      sendPayment({
        receiver: this.manager.value,
        amount: commission
      });
    }
    winner.hasReceivedPot = true;
    this.members(winnerAddress).value = winner;
    this.clearBids();
    this.currentMonth.value = this.currentMonth.value + 1;
    if (this.currentMonth.value > this.totalMembers.value) {
      this.isActive.value = false;
    }
  }
  private clearBids(): void {}
  getMemberDetails(memberAddress: Address): Member {
    return this.members(memberAddress).value;
  }
  getCurrentMonth(): uint64 {
    return this.currentMonth.value;
  }
  getChitStatus(): boolean {
    return this.isActive.value;
  }
  pauseChit(): void {
    assert(this.txn.sender === this.manager.value, 'Only manager can pause');
    this.isActive.value = false;
  }
  resumeChit(): void {
    assert(this.txn.sender === this.manager.value, 'Only manager can resume');
    this.isActive.value = true;
  }
}