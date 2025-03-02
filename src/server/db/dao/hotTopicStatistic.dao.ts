import { hotTopicStatistics as HTS } from '../models/hotTopicStatistic';

class HotTopicStatisticDao {
  async createOrUpdate(data: { topicId: number }) {
    return HTS.upsert({
      where: {
        topicId: data.topicId,
      },
      update: {
        clickCount: {
          increment: 1,
        },
      },
      create: {
        topicId: data.topicId,
        clickCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  getAllClickCount() {
    return HTS.findMany({
      select: {
        topicId: true,
        clickCount: true,
      },
    });
  }

  checkAndRemoveStatisticInfoNotToday() {
    return HTS.deleteMany({
      where: {
        createdAt: {
          lt: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
  }
}

const hotTopicStatisticDao = new HotTopicStatisticDao();
export default hotTopicStatisticDao;
