namespace Firestore {

  // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#Operator_1 FieldFilter Operator}
  const fieldOps: any = {
    "==": "EQUAL",
    "===": "EQUAL",
    // tslint:disable-next-line: object-literal-sort-keys
    "<": "LESS_THAN",
    "<=": "LESS_THAN_OR_EQUAL",
    ">": "GREATER_THAN",
    ">=": "GREATER_THAN_OR_EQUAL",
    "contains": "ARRAY_CONTAINS",
  };

  // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#Operator_2 FieldFilter Operator}
  const unaryOps: any = {
    nan: "IS_NAN",
    null: "IS_NULL",
  };

  // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#FieldReference Field Reference}
  function fieldRef(field: any): any {
    return { fieldPath: field };
  }

  function filter(field: string, operator: string, value: any): any {
    // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#FieldFilter Field Filter}
    if (operator in fieldOps) {
      if (value == null) { // Covers null and undefined values
        operator = "null";
      } else if (Util.isNumberNaN(value)) { // Covers NaN
        operator = "nan";
      } else {
        return {
          fieldFilter: {
            field: fieldRef(field),
            op: fieldOps[operator],
            value: Firestore.wrapValue(value),
          },
        };
      }
    }

    // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#UnaryFilter Unary Filter}
    if (operator.toLowerCase() in unaryOps) {
      return {
        unaryFilter: {
          field: fieldRef(field),
          op: unaryOps[operator],
        },
      };
    }
    throw new Error("Invalid Operator given " + operator);
  }

  /**
   * This callback type is called `queryCallback`.
   *  Callback should utilize the Query parameter to send a request and return the response.
   *
   * @callback queryCallback
   * @param {object} query the Structured Query to utilize in the query request {@link FirestoreQuery_}
   * @returns [object] response of the sent query
   */

  /**
   * An object that acts as a Query to be a structured query.
   * Chain methods to update query. Must call .execute to send request.
   *
   * @constructor
   * @private
   * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery
   * Firestore Structured Query}
   * @param {string} from the base collection to query
   * @param {queryCallback} callback the function that is executed with the internally compiled query
   */
  export class QueryDef {

    private query: any = {};
    private callback: any;

    constructor(from: any, callback: any) {
      this.callback = callback;
      if (from) {
        this.query.from = [{ collectionId: from }];
      }
    }

    /**
     * Select Query which can narrow which fields to return.
     *  Can be repeated if multiple fields are needed in the response.
     *
     * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#Projection Select}
     * @param {string} field The field to narrow down (if empty, returns name of document)
     * @returns {object} this query object for chaining
     */
    public select(field?: string): QueryDef {
      if (!this.query.select) {
        this.query.select = { fields: [] };
      }
      if (!field || !field.trim()) { // Catch undefined or blank strings
        field = "__name__";
      }

      this.query.select.fields.push(fieldRef(field));
      return this;
    }

    /**
     * Filter Query by a given field and operator (or additionally a value).
     *  Can be repeated if multiple filters required.
     *  Results must satisfy all filters.
     *
     * @param {string} field The field to reference for filtering
     * @param {string} operator The operator to filter by. {@link fieldOps} {@link unaryOps}
     * @param {*} [value] Object to set the field value to. Null if using a unary operator.
     * @returns {object} this query object for chaining
     */
    public where(field: string, operator: string, value: any): QueryDef {
      if (this.query.where) {
        if (!this.query.where.compositeFilter) {
          this.query.where = {
            compositeFilter: {
              op: "AND", // Currently "OR" is unsupported
              filters: [
                this.query.where,
              ],
            },
          };
        }
        this.query.where.compositeFilter.filters.push(filter(field, operator, value));
      } else {
        this.query.where = filter(field, operator, value);
      }
      return this;
    }

    /**
     * Orders the Query results based on a field and specific direction.
     *  Can be repeated if additional ordering is needed.
     *
     * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#Projection Select}
     * @param {string} field The field to order by.
     * @param {string} dir The direction to order the field by. Should be one of "asc" or "desc". Defaults to Ascending.
     * @returns {object} this query object for chaining
     */
    public orderBy(field: string, dir: string): QueryDef {
      if (!this.query.orderBy) {
        this.query.orderBy = [];
      }
      const isDesc = dir && (dir.substr(0, 3).toUpperCase() === "DEC" || dir.substr(0, 4).toUpperCase() === "DESC");

      this.query.orderBy.push({
        field: fieldRef(field),
        direction: isDesc ? "DESCENDING" : "ASCENDING",
      });
      return this;
    }

    /**
     * Offsets the Query results by a given number of documents.
     *
     * @param {number} offset Number of results to skip
     * @returns {object} this query object for chaining
     */
    public offset(offset: number): QueryDef {
      if (!Util.isNumeric(offset)) {
        throw new TypeError("Offset is not a valid number!");
      }
      this.query.offset = offset;
      return this;
    }

    /**
     * Limits the amount Query results returned.
     *
     * @param {number} limit Number of results limit
     * @returns {object} this query object for chaining
     */
    public limit(limit: number): QueryDef {
      if (!Util.isNumeric(limit)) {
        throw new TypeError("Limit is not a valid number!");
      }
      this.query.limit = limit;
      return this;
    }

    /**
     * Executes the query with the given callback method and the generated query.
     *  Must be used at the end of any query for execution.
     *
     * @returns {object} The query results from the execution
     */
    public execute(): any {
      return this.callback(this.query); // Not using callback.bind due to debugging limitations of GAS
    }
  }
}
