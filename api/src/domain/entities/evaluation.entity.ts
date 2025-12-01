export enum EvaluationStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export class Evaluation {
  constructor(
    public readonly id: string,
    public name: string,
    public startDate: Date,
    public endDate: Date,
    public duration: number,
    public maxAttempts: number | null,
    public status: EvaluationStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(
    name: string,
    startDate: Date,
    endDate: Date,
    duration: number,
    maxAttempts: number | null,
  ): Evaluation {
    const now = new Date();
    const status = startDate > now ? EvaluationStatus.SCHEDULED : EvaluationStatus.ACTIVE;
    
    return new Evaluation(
      '',
      name,
      startDate,
      endDate,
      duration,
      maxAttempts,
      status,
      now,
      now,
    );
  }

  isActive(): boolean {
    const now = new Date();
    return (
      this.status === EvaluationStatus.ACTIVE &&
      now >= this.startDate &&
      now <= this.endDate
    );
  }

  isClosed(): boolean {
    return this.status === EvaluationStatus.CLOSED || new Date() > this.endDate;
  }

  canSubmit(): boolean {
    return this.isActive() && !this.isClosed();
  }

  activate(): Evaluation {
    return new Evaluation(
      this.id,
      this.name,
      this.startDate,
      this.endDate,
      this.duration,
      this.maxAttempts,
      EvaluationStatus.ACTIVE,
      this.createdAt,
      new Date(),
    );
  }

  close(): Evaluation {
    return new Evaluation(
      this.id,
      this.name,
      this.startDate,
      this.endDate,
      this.duration,
      this.maxAttempts,
      EvaluationStatus.CLOSED,
      this.createdAt,
      new Date(),
    );
  }
}



