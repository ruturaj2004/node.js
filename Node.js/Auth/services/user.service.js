const UserModel = require("../schema/user.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const bcrypt = require("bcryptjs");

class UserService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    updateUserDetails(id, details) {
        return this.execute(() => {
            return UserModel.findByIdAndUpdate(
                id,
                {
                    name: details.name,
                    password: details.password,
                    email: details.email,
                    gender: details.gender,
                    profile_pic: details.profile_pic,
                },
                { new: true }
            );
        });
    }
    async save(userDto) {
        try {
            userDto.password = bcrypt.hashSync(userDto.password, 10);
            const user = new UserModel(userDto);
            const newUser = await user.save();
            return new ServiceResponse({
                data: { ...newUser._doc, password: null },
                token: newUser.token,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

    async getUserByUserName(userName) {
        try {
            const user = await UserModel.findOne({
                $or: [{ phoneNumber: userName }, { email: userName }],
            });
            return user
                ? new ServiceResponse({
                      data: user,
                  })
                : new ServiceResponse({
                      isError: true,
                      message: "User not found",
                  });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };

        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        if (criteria.mobile) query.mobile = criteria.mobile;
        if (criteria.phoneNumber) query.phoneNumber = criteria.phoneNumber;
        if (criteria.email) query.email = criteria.email;

        return this.preparePaginationAndReturnData(query, criteria);
    }
    async checkPhoneNumberAvailability(phoneNumber) {
        try {
            const user = await UserModel.findOne({ phoneNumber: phoneNumber });
            return user
                ? new ServiceResponse({
                      data: false,
                  })
                : new ServiceResponse({
                      data: true,
                  });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

    async checkEmailAvailability(email) {
        try {
            const user = await UserModel.findOne({ email: email });
            return user
                ? new ServiceResponse({
                      data: false,
                  })
                : new ServiceResponse({
                      data: true,
                  });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

    async saveMpin({ pin, userId }) {
        try {
            const user = await UserModel.findByIdAndUpdate(userId, {
                mpin: pin,
            });

            if (!user) {
                throw new Error("user does not exist");
            }

            return new ServiceResponse({
                message: "MPIN, Saved succesfully",
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

    async validateMpin({ pin, userId }) {
        try {
            const user = await UserModel.findById(userId);

            if (!user) {
                return new ServiceResponse({
                    isClientError: true,
                    message: "user does not exist",
                });
            }

            if (user._doc.mpin !== pin) {
                return new ServiceResponse({
                    isClientError: true,
                    message: "Invalid MPIN!!",
                });
            }
            return new ServiceResponse({
                message: "MPIN, Validated succesfully",
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
}

module.exports = new UserService(UserModel, "user");
