// /api/v1/test?search=shortsleeves&rating=4&price[lte]=999&price[gte]=100&page=1

// req.query
// {
//     search: 'shortsleeves',
//     rating: '4',
//     price: { lte: '999', gte: '100' },
//     page: '1\n'
// }

// just a demonstration of how to use query parameters in a route
// replace gte with $gte and lte with $lte in the query object
// User.find({ rating: { $gte: 4 } });

// conversion of query parameters to a query object and replacing gte and lte with $gte and $lte

// demo
// const p = "gt gte lt lte in nin";

// const regex = /\b(gt|gte|lt|lte|in|min)\b/g;

// console.log(p.replace(regex, (m) => `$${m}`));
// output: $gt $gte $lt $lte $in $nin

// base = Product.find()
// BigQ = /api/v1/test?search=shortsleeves&rating=4&price[lte]=999&price[gte]=100&page=1

class whereClause {
    constructor(base, bigQ) {
        this.base = base;
        this.bigQ = bigQ;
    }
    search() {
        const searchWord = this.bigQ.search
            ? {
                  name: {
                      $regex: this.bigQ.search,
                      $options: "i", //case insensitive g- global search
                  },
              }
            : {};
        this.base = this.base.find({ ...searchWord });
        return this;
    }

    filter() {
        const copyQ = { ...this.bigQ };

        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];

        // convert bigQ in string
        let StrBigQ = JSON.stringify(copyQ);
        const regex = /\b(gte|lte|gt|lt)\b/g;
        StrBigQ = StrBigQ.replace(regex, (m) => `$${m}`);

        const jsonOfString = JSON.parse(StrBigQ);

        this.base = this.base.find(jsonOfString);
        return this;
    }

    pager(resultPerPage) {
        let currentPage = 1;

        if (this.bigQ.page) {
            currentPage = this.bigQ.page;
        }

        const skipVal = resultPerPage * (currentPage - 1);
        //  consider we show 20 items per page
        // 1st page = 20 * (1-1) = skip = 0
        // 2nd Page = 20 * (2-1) = skip 1st 20 product

        this.base = this.base.limit(resultPerPage).skip(skipVal);
``
        return this;
    }
}

export { whereClause };
