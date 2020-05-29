// import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    // TODO
    const transactionsRepository = await getCustomRepository(
      TransactionsRepository,
    );
    const transaction = await transactionsRepository.findOneOrFail(id);
    if (!transaction) {
      throw new AppError('Transaction is not exist');
    }
    await transactionsRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
