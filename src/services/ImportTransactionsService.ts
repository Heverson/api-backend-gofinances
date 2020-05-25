import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, getCustomRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const categoryRepositories = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const contactsReadStream = fs.createReadStream(filePath);
    const parsers = csvParse({
      from_line: 2,
    });
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    const parseCSV = contactsReadStream.pipe(parsers);
    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    // ele vai retornar o que ocorreu na chamada end do parseCSV
    await new Promise(resolve => parseCSV.on('end', resolve));
    console.log(transactions);
    console.log(categories);
    const existentsCategories = await categoryRepositories.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitles = existentsCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index); // self retorna um array

    const newCategories = categoryRepositories.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoryRepositories.save(newCategories);

    const finalCategories = [...newCategories, ...existentsCategories];

    const createTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createTransactions);

    await fs.promises.unlink(filePath);

    return createTransactions;
  }
}

export default ImportTransactionsService;
