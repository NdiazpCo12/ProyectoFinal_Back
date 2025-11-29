export class Course {
  constructor(
    public readonly id: string,
    public name: string,
    public nrc: string,
    public period: string,
    public group: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(
    name: string,
    nrc: string,
    period: string,
    group: number,
  ): Course {
    const now = new Date();
    return new Course(
      '',
      name,
      nrc,
      period,
      group,
      now,
      now,
    );
  }

  update(
    name?: string,
    nrc?: string,
    period?: string,
    group?: number,
  ): Course {
    return new Course(
      this.id,
      name ?? this.name,
      nrc ?? this.nrc,
      period ?? this.period,
      group ?? this.group,
      this.createdAt,
      new Date(),
    );
  }
}

