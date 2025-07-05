import { faker } from '@faker-js/faker';
import User from './models/user';
import Project from './models/project';
import Task from './models/task';
import logger from './utils/logger';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    const taskCount = await Task.countDocuments();

    if (userCount > 0 || projectCount > 0 || taskCount > 0) {
      logger.info('Database not empty, skipping seed');
      return;
    }

    logger.info('Seeding database with sample data...');

    // 1. Users
    const users = await User.create(
      Array.from({ length: 10 }).map(() => ({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName()
      }))
    );

    // 2. Projects
    const projects = await Project.create(
      Array.from({ length: 5 }).map(() => {
        const owner = faker.helpers.arrayElement(users);
        const members = faker.helpers.arrayElements(users, {
          min: 0,
          max: 5
        }).map((u) => u._id);
        return {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          ownerId: owner._id,
          members
        };
      })
    );

    // 3. Tasks
    await Task.create(
      Array.from({ length: 20 }).map(() => {
        const creator = faker.helpers.arrayElement(users);
        const maybeProject = faker.datatype.boolean()
          ? faker.helpers.arrayElement(projects)
          : null;
        const assigned = faker.helpers.arrayElement(users);
        return {
          title: faker.word.words({ count: { min: 2, max: 5 } }),
          description: faker.lorem.sentence(),
          status: faker.helpers.arrayElement(['pending', 'in-progress', 'completed'] as const),
          priority: faker.helpers.arrayElement(['low', 'medium', 'high'] as const),
          dueDate: faker.date.soon({ days: 30 }),
          assignedTo: assigned._id,
          projectId: maybeProject?._id,
          createdBy: creator._id
        };
      })
    );

    logger.info('Seeding completed');
  } catch (err) {
    logger.error(`Seed error: ${err}`);
  }
}; 