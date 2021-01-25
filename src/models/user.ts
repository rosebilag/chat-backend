import { Document, Model, model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from '../constants';

type User = {
	username: String;
	firstName: String;
	lastName?: String;
	email: String;
	password: String;
	isOnline: Boolean;
};
type UserDocument = Document & User;
type UserModel = Model<UserDocument>;

const userSchema = new Schema<UserModel>(
	{
		username: {
			type: String,
			required: true,
			unique: true
		},
		firstName: {
			type: String,
			required: true
		},
		lastName: {
			type: String
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		isOnline: {
			type: Boolean,
			required: true,
			default: false
		}
		// socketID
	},
	{ timestamps: true }
);

// TODO test virtual fullName
userSchema.virtual('fullName').get(function(this: User) {
	return this.firstName + ' ' + this.lastName;
});

userSchema.statics.createUser = async function(userDetails: User) {
	try {
		const hash = await bcrypt.hash(userDetails.password, 10);
		userDetails.password = hash;
		const user = await User.create(userDetails);
		return user;
	} catch (error) {
		throw error;
	}
};

userSchema.statics.checkAvailability = async function(value: String, type: String) {
	try {
		const existingUser =
			type === 'email' ? await User.findOne({ email: value }) : await User.findOne({ username: value });
		return existingUser ? false : true;
	} catch (error) {
		throw error;
	}
};

userSchema.statics.changeLoginStatus = async function(id: String, newValue: Boolean) {
	try {
		const user = await User.findByIdAndUpdate(id, { isOnline: newValue });
		if (!user) throw { error: ERROR_MESSAGES.USER_NOT_FOUND };
		return user;
	} catch (error) {
		throw error;
	}
};

userSchema.statics.getUserById = async function(id: String) {
	try {
		const user = await User.findById(id);
		if (!user) throw { error: ERROR_MESSAGES.USER_NOT_FOUND };
		return user;
	} catch (error) {
		throw error;
	}
};

userSchema.statics.getUsers = async function() {
	try {
		const user = await User.find();
		return user;
	} catch (error) {
		throw error;
	}
};

userSchema.statics.findByLogin = async function(login: String) {
	try {
		// todo merge query
		let user = await User.findOne({
			username: login
		});
		if (!user) {
			user = await User.findOne({ email: login });
		}
		return user;
	} catch (error) {
		throw error;
	}
};

userSchema.statics.deleteUserById = async function(id: String) {
	try {
		// todo try findbyidanddelete
		const user = await User.findOneAndDelete({ _id: id });
		return user;
	} catch (error) {
		throw error;
	}
};

// TODO handling of deleted user's msgs and rooms
// userSchema.pre('remove', function(next: any) {
// 	this.model('Message').deleteMany({ user: this._id }, next);
// });

// TODO password hash
// userSchema.pre<UserDocument>("save", function(next) {
//   if (this.isModified("password")) {
//     this.password = hashPassword(this.password)
//   }
// });

const User = model<UserDocument, UserModel>('User', userSchema);

export default User;
