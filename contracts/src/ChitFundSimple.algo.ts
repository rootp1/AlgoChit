import { Contract } from '@algorandfoundation/tealscript';

export class ChitFundSimple extends Contract {
  // State variables
  manager = GlobalStateKey<Address>();
  monthlyContribution = GlobalStateKey<uint64>();
  managerCommissionPercent = GlobalStateKey<uint64>();
  totalMembers = GlobalStateKey<uint64>();
  currentMonth = GlobalStateKey<uint64>();
  chitValue = GlobalStateKey<uint64>();
  isActive = GlobalStateKey<uint64>(); // 0 or 1

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
    this.isActive.value = 0;
  }

  // Start the chit fund cycle
  startChit(): void {
    assert(this.txn.sender === this.manager.value);
    assert(this.isActive.value === 0);

    this.isActive.value = 1;
    this.currentMonth.value = 1;
  }

  // Member makes monthly contribution (payment txn must be in group)
  contribute(): void {
    assert(this.isActive.value === 1);

    // Verify payment transaction
    verifyPayTxn(this.txnGroup[this.txn.groupIndex - 1], {
      receiver: this.app.address,
      amount: this.monthlyContribution.value,
    });
  }

  // Submit a bid
  submitBid(discountPercent: uint64): void {
    assert(this.isActive.value === 1);
    assert(discountPercent <= 30);
  }

  // Manager distributes pot to winner
  distributePot(winnerAddress: Address, discountPercent: uint64): void {
    assert(this.txn.sender === this.manager.value);
    assert(this.isActive.value === 1);

    // Calculate payout
    const discountAmount = (this.chitValue.value * discountPercent) / 100;
    const potAfterDiscount = this.chitValue.value - discountAmount;

    // Calculate manager commission
    const commission = (discountAmount * this.managerCommissionPercent.value) / 100;

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

    // Move to next month
    this.currentMonth.value = this.currentMonth.value + 1;

    // Check if chit cycle is complete
    if (this.currentMonth.value > this.totalMembers.value) {
      this.isActive.value = 0;
    }
  }

  // Get current month
  getCurrentMonth(): uint64 {
    return this.currentMonth.value;
  }

  // Get chit status
  getChitStatus(): uint64 {
    return this.isActive.value;
  }

  // Emergency pause
  pauseChit(): void {
    assert(this.txn.sender === this.manager.value);
    this.isActive.value = 0;
  }

  // Resume chit
  resumeChit(): void {
    assert(this.txn.sender === this.manager.value);
    this.isActive.value = 1;
  }
}
