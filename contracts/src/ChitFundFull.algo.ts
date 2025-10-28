import { Contract } from '@algorandfoundation/tealscript';
export class ChitFundFull extends Contract {
  manager = GlobalStateKey<Address>();
  monthlyContribution = GlobalStateKey<uint64>();
  managerCommissionPercent = GlobalStateKey<uint64>();
  totalMembers = GlobalStateKey<uint64>();
  currentMonth = GlobalStateKey<uint64>();
  chitValue = GlobalStateKey<uint64>();
  isActive = GlobalStateKey<uint64>();
  createApplication(monthlyContrib: uint64, commissionPercent: uint64, totalMembersCount: uint64): void {
    this.manager.value = this.txn.sender;
    this.monthlyContribution.value = monthlyContrib;
    this.managerCommissionPercent.value = commissionPercent;
    this.totalMembers.value = totalMembersCount;
    this.currentMonth.value = 0;
    this.chitValue.value = monthlyContrib * totalMembersCount;
    this.isActive.value = 0;
  }
  addMember(memberAddress: Address): void {
    assert(this.txn.sender === this.manager.value);
    assert(this.isActive.value === 0);
    const memberData = bzero(49);
  }
  removeMember(memberAddress: Address): void {
    assert(this.txn.sender === this.manager.value);
    assert(this.isActive.value === 0);
  }
  startChit(): void {
    assert(this.txn.sender === this.manager.value);
    assert(this.isActive.value === 0);
    this.isActive.value = 1;
    this.currentMonth.value = 1;
  }
  contribute(): void {
    assert(this.isActive.value === 1);
    verifyPayTxn(this.txnGroup[this.txn.groupIndex - 1], {
      receiver: this.app.address,
      amount: this.monthlyContribution.value
    });
  }
  submitBid(discountPercent: uint64): void {
    assert(this.isActive.value === 1);
    assert(discountPercent <= 30);
  }
  distributePot(winnerAddress: Address, discountPercent: uint64): void {
    assert(this.txn.sender === this.manager.value);
    assert(this.isActive.value === 1);
    const discountAmount = this.chitValue.value * discountPercent / 100;
    const potAfterDiscount = this.chitValue.value - discountAmount;
    const commission = discountAmount * this.managerCommissionPercent.value / 100;
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
    this.currentMonth.value = this.currentMonth.value + 1;
    if (this.currentMonth.value > this.totalMembers.value) {
      this.isActive.value = 0;
    }
  }
  getCurrentMonth(): uint64 {
    return this.currentMonth.value;
  }
  getChitStatus(): uint64 {
    return this.isActive.value;
  }
  pauseChit(): void {
    assert(this.txn.sender === this.manager.value);
    this.isActive.value = 0;
  }
  resumeChit(): void {
    assert(this.txn.sender === this.manager.value);
    this.isActive.value = 1;
  }
}