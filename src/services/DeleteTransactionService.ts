import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<Transaction> {
    const transactionsRepository = getRepository(Transaction);
    const transaction = await transactionsRepository.findOne({
      where: { id },
    });

    if (transaction) {
      await transactionsRepository.delete(id);
    } else {
      throw new AppError('Should not be able to find this transaction');
    }
    return transaction;
  }
}

export default DeleteTransactionService;
