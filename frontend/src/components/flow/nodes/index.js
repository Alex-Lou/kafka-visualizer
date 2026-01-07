import ApplicationNode from './ApplicationNode';
import TopicNode from './TopicNode';
import ConsumerGroupNode from './ConsumerGroupNode';
import DatabaseNode from './DatabaseNode';

export {
  ApplicationNode,
  TopicNode,
  ConsumerGroupNode,
  DatabaseNode,
};

export const nodeTypes = {
  application: ApplicationNode,
  topic: TopicNode,
  consumerGroup: ConsumerGroupNode,
  database: DatabaseNode,
};