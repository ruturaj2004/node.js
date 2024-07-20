const { default: mongoose } = require("mongoose");
const privateWaterTaxModel = require("../../schema/propertyTax/privateWaterTax.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const taxationPeriodService = require("./taxationPeriod.service");
class privateWaterTaxService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getByYear(from, to) {
        const period = await taxationPeriodService.getPeriodByFromAndToYear(
            from,
            to,
            "Water"
        );

        const resp = await this.execute(async () => {
            return await this.model.find({
                taxationPeriod: period._id,
            });
        });

        return resp;
    }
    async getByMin(taxationPeriod, criteria) {
        const query = {
            taxationPeriod: new mongoose.Types.ObjectId(taxationPeriod),
        };

        if (criteria.min) {
            query["propertyArea.min"] = criteria.min;
        }

        if (criteria.max) {
            query["propertyArea.max"] = criteria.max;
        }

        return await this.preparePaginationAndReturnData(query, criteria);
    }
    async getByTaxType(subTaxType, pagination) {
        const query =
            subTaxType === "private"
                ? {}
                : {
                      subTaxType: subTaxType,
                  };

        return await this.preparePaginationAndReturnData(query, pagination);
    }
    async getByTaxationPeriod(taxationPeriod, pagination) {
        return await this.preparePaginationAndReturnData(
            {
                taxationPeriod: new mongoose.Types.ObjectId(taxationPeriod),
            },
            pagination
        );
    }
}

module.exports = new privateWaterTaxService(
    privateWaterTaxModel,
    "privateWaterTax"
);