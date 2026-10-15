export abstract class EventPublisherPort {
  abstract publish<TPayload>(topic: string, payload: TPayload): Promise<void>;
}
