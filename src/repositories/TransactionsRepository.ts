import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async all(): Promise<Transaction[]> {
    const transaction = await this.find({
      relations: ['category'],
    });

    return transaction;
  }

  public async getBalance(): Promise<Balance> {
    // TODO
    const transactions = await this.all();
    const outCometransactions = transactions
      .filter(item => item.type === 'outcome')
      .reduce((sum, { value }) => sum + value, 0);

    const inCometransactions = transactions
      .filter(item => item.type === 'income')
      .reduce((sum, { value }) => sum + value, 0);

    const balance = {
      income: inCometransactions,
      outcome: outCometransactions,
      total: inCometransactions - outCometransactions,
    };
    return balance;
  }
}

export default TransactionsRepository;
