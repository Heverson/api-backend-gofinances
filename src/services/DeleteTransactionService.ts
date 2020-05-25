// import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    // TODO
    const transactionsRepository = await getCustomRepository(
      TransactionsRepository,
    );
    const transaction = await transactionsRepository.findOneOrFail(id);
    if (transaction) {
      await transactionsRepository.delete({ id });
    }
  }
}

export default DeleteTransactionService;
