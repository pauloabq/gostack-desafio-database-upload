import { getRepository, getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);

    const transactionRepository = getCustomRepository(TransactionsRepository);
    try {
      const balance = await transactionRepository.getBalance();
      if (type === 'outcome' && value > balance.total) {
        throw new AppError(
          'Should not create transaction. Outcome exceeds total',
          400,
        );
      }

      let categoryTransaction = await categoryRepository.findOne({
        where: { title: category },
      });
      if (!categoryTransaction) {
        categoryTransaction = categoryRepository.create({
          title: category,
        });
        await categoryRepository.save(categoryTransaction);
      }

      const { id: category_id } = categoryTransaction;

      const transaction = transactionRepository.create({
        title,
        type,
        value,
        category_id,
      });
      await transactionRepository.save(transaction);

      const data = { ...transaction };
      data.category = categoryTransaction;
      return data;
    } catch (err) {
      throw new AppError(err.message);
    }
  }
}

export default CreateTransactionService;
