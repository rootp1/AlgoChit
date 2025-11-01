import { Contract } from '@algorandfoundation/tealscript';
export class ChitFundSimple extends Contract {
  manager = GlobalStateKey<Address>();
  monthlyContribution = GlobalStateKey<uint64>();
  managerCommissionPercent = GlobalStateKey<uint64>();
  totalMembers = GlobalStateKey<uint64>();
  currentMonth = GlobalStateKey<uint64>();
  chitValue = GlobalStateKey<uint64>();
  isActive = GlobalStateKey<uint64>();
  
  members = BoxMap<Address, uint64>({ prefix: 'm' });
  bids = BoxMap<Address, uint64>({ prefix: 'b' });
  createApplication(monthlyContrib: uint64, commissionPercent: uint64, totalMembersCount: uint64): void {
    this.manager.value = this.txn.sender;
    this.monthlyContribution.value = monthlyContrib;
    this.managerCommissionPercent.value = commissionPercent;
    this.totalMembers.value = totalMembersCount;
    this.currentMonth.value = 0;
    this.chitValue.value = monthlyContrib * totalMembersCount;
    this.isActive.value = 0;
  }
  startChit(): void {
    assert(this.txn.sender === this.manager.value);
    assert(this.isActive.value === 0);
    this.isActive.value = 1;
    this.currentMonth.value = 1;
  }

  addMember(memberAddress: Address): void {
    assert(this.txn.sender === this.manager.value);
    this.members(memberAddress).value = 1;
  }

  removeMember(memberAddress: Address): void {
    assert(this.txn.sender === this.manager.value);
    assert(this.isActive.value === 0);
    if (this.members(memberAddress).exists) {
      this.members(memberAddress).delete();
    }
    if (this.bids(memberAddress).exists) {
      this.bids(memberAddress).delete();
    }
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
    this.bids(this.txn.sender).value = discountPercent;
  }
  distributePot(
    winnerAddress: Address, 
    discountPercent: uint64, 
    memberAddresses: Address[]
  ): void {
    assert(this.txn.sender === this.manager.value);
    assert(this.isActive.value === 1);
    
    const discountAmount = this.chitValue.value * discountPercent / 100;
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
    
    if (remainingDiscount > 0 && memberAddresses.length > 0) {
      let nonWinnerCount: uint64 = 0;
      for (let i = 0; i < memberAddresses.length; i = i + 1) {
        if (memberAddresses[i] !== winnerAddress) {
          nonWinnerCount = nonWinnerCount + 1;
        }
      }
      
      if (nonWinnerCount > 0) {
        const perMemberShare = remainingDiscount / nonWinnerCount;
        
        for (let i = 0; i < memberAddresses.length; i = i + 1) {
          if (memberAddresses[i] !== winnerAddress) {
            sendPayment({
              receiver: memberAddresses[i],
              amount: perMemberShare
            });
          }
        }
      }
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
  updateTotalMembers(newTotal: uint64): void {
    assert(this.txn.sender === this.manager.value);
    assert(newTotal > 0);
    this.totalMembers.value = newTotal;
    this.chitValue.value = this.monthlyContribution.value * newTotal;
  }
}