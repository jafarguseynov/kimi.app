export interface MarketQuestion {
  id: string;
  text: string;
  reward: number;
  authorId: string;
  authorName: string;
  answerCount: number;
  isAccepted: boolean;
  createdAt: string;
}

export interface MarketAnswer {
  id: string;
  questionId: string;
  text: string;
  authorId: string;
  authorName: string;
  isAccepted: boolean;
  createdAt: string;
}
