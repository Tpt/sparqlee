import type * as RDF from '@rdfjs/types';
import type { Algebra } from 'sparqlalgebrajs';
import { BaseAggregateEvaluator } from './evaluatorHelpers/BaseAggregateEvaluator';
import type { ISyncEvaluatorContext } from './SyncEvaluator';
import { SyncEvaluator } from './SyncEvaluator';

// TODO: Support hooks & change name to SyncAggregateEvaluator
export class AggregateEvaluator extends BaseAggregateEvaluator {
  private readonly evaluator: SyncEvaluator;

  public constructor(expr: Algebra.AggregateExpression, context?: ISyncEvaluatorContext, throwError?: boolean) {
    super(expr, SyncEvaluator.completeContext(context || {}), throwError);
    this.evaluator = new SyncEvaluator(expr.expression, context);
  }

  public put(bindings: RDF.Bindings): void {
    this.init(bindings);
  }

  protected __put(bindings: RDF.Bindings): void {
    try {
      const term = this.evaluator.evaluate(bindings);
      this.state = this.aggregator.put(this.state, term);
    } catch (error: unknown) {
      this.safeThrow(error);
    }
  }

  protected safeThrow(err: unknown): void {
    if (this.throwError) {
      throw err;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      this.put = () => {};
      // eslint-disable-next-line unicorn/no-useless-undefined
      this.result = () => undefined;
    }
  }

  private init(start: RDF.Bindings): void {
    try {
      const startTerm = this.evaluator.evaluate(start);
      this.state = this.aggregator.init(startTerm);
      if (this.state) {
        this.put = this.__put.bind(this);
        this.result = this.__result.bind(this);
      }
    } catch (error: unknown) {
      this.safeThrow(error);
    }
  }
}

