class APIFeatures {
  constructor(dbModel, queryObj) {
    this.dbModel = dbModel;
    this.transformQueryObj(queryObj);
  }

  transformQueryObj(queryObj) {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    this.queryObj = { ...queryObj };
    this.splitExcludedFields();

    this.transformComparators();
  }

  splitExcludedFields() {
    this.sortFields = this.queryObj.sort;
    this.fields = this.queryObj.fields;
    this.page = +this.queryObj.page;
    this.limit = +this.queryObj.limit;
    const excludedFields = ['page', 'limit', 'sort', 'limit', 'fields'];

    excludedFields.forEach(field => {
      delete this.queryObj[field];
    });
  }

  transformComparators() {
    // conversion : { difficulty: 'easy', duration: { $gte: 5 } } <= duration: { gte: ...} <= duration[gte]=...
    let queryStr = JSON.stringify(this.queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.queryObj = JSON.parse(queryStr);
  }

  build(filter) {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    this.query = this.dbModel.find({
      $and: [{ ...this.queryObj }, { ...filter }],
    }); // QUERY Building

    return this;
  }

  sort() {
    // descending orders : - at the beginning
    // replace "," separator by empty space to be able to sort by multiple values
    if (this.sortFields) this.query.sort(this.sortFields.split(',').join(' '));
    else this.query.sort('-createdAt');

    return this;
  }

  limitFields() {
    if (this.fields) this.query.select(this.fields.split(',').join(' '));
    else this.query.select('-__v'); // exclude the _v field from the response

    return this;
  }

  async paginate() {
    // skip : amount of results to be skipped before querying data
    // limit : amount of result we want to return
    // page=2&limit=10 => 0 (page 1) 10 (page 2), 20 (page 3) => (page - 1) * limit
    if (this.page || this.limit) {
      const page = this.page || 1;
      const limit = this.limit || 10;
      const skip = (page - 1) * limit;

      const nbTours = await this.dbModel.countDocuments();

      if (nbTours <= skip) throw new Error("This page doesn't exist.");

      this.query.skip(skip).limit(limit);

      return this;
    }
    return this;
  }

  getQuery() {
    return this.query;
  }
}

module.exports = APIFeatures;
