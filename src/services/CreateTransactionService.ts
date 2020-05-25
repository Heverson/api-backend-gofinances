import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && balance.total < value) {
      if (balance.total <= balance.outcome + value) {
        throw new AppError('Spending exceeds your income', 400);
      }
    }
    const categoryRepository = getRepository(Category);
    let categoryExist = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });
    if (!categoryExist) {
      categoryExist = await categoryRepository.save({ title: category });
    }

    const transaction = getRepository(Transaction);
    const result = await transaction.save({
      title,
      type,
      value,
      category: categoryExist,
    });

    return result;
  }
}

export default CreateTransactionService;
