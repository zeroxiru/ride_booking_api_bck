/* eslint-disable @typescript-eslint/no-inferrable-types */
import mongoose, { Schema, Model } from 'mongoose';
import { IDriverProfile } from './driver.interface';
// import { IUser } from '../user/user.interface';

// Vehicle schema
const VehicleSchema = new Schema({
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Vehicle year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Vehicle year cannot be in the future']
  },
  color: {
    type: String,
    required: [true, 'Vehicle color is required'],
    trim: true
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    uppercase: true,
    trim: true
  }
});

// Driver Profile schema
const DriverProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  vehicle: {
    type: VehicleSchema,
    required: [true, 'Vehicle information is required']
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  insuranceProvider: {
    type: String,
    required: [true, 'Insurance provider is required'],
    trim: true
  },
  insuranceValidUntil: {
    type: Date,
    required: [true, 'Insurance validity date is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Insurance must be valid (future date)'
    }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]
      
    },
    averageRating: {
      type: Number,
    },
  totalRatings: {
    type: Number
  },
    address: {
      type: String,
      trim: true
    }
  },
  totalRidesCompleted: {
    type: Number,
    default: 0,
    min: [0, 'Total rides cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  documents: {
    license: {
      type: String,
      required: [true, 'License document is required'],
      trim: true
    },
    insurance: {
      type: String,
      required: [true, 'Insurance document is required'],
      trim: true
    },
    vehicleRegistration: {
      type: String,
      required: [true, 'Vehicle registration document is required'],
      trim: true
    }
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
 timestamps: true,
//   toJSON: {
//     virtuals: true,
//     transform: function(doc, ret) {
//       // Convert _id to id
//       ret.id = ret._id.toString();
//       delete ret._id;
      
//       // Remove version key
//       if (ret.__v !== undefined) {
//         delete ret.__v;
//       }
      
//       return ret;
//     }
//   }
}
);

// Index for geospatial queries
DriverProfileSchema.index({ 'currentLocation.coordinates': '2dsphere' });

// Index for frequently queried fields
DriverProfileSchema.index({ isOnline: 1, isAvailable: 1 });
DriverProfileSchema.index({ approved: 1 });

// Virtual for formatted insurance validity date
DriverProfileSchema.virtual('insuranceValidityFormatted').get(function() {
  return this.insuranceValidUntil.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for driver status
DriverProfileSchema.virtual('status').get(function() {
  if (!this.approved) return 'pending_approval';
  if (this.isOnline && this.isAvailable) return 'available';
  if (this.isOnline && !this.isAvailable) return 'busy';
  return 'offline';
});

// Pre-save middleware to update availability based on online status
DriverProfileSchema.pre('save', function(next) {
  // If driver is going offline, set availability to false
  if (this.isModified('isOnline') && !this.isOnline) {
    this.isAvailable = false;
  }
  
  // If driver is going online but wasn't approved, keep availability false
  if (this.isModified('isOnline') && this.isOnline && !this.approved) {
    this.isAvailable = false;
  }
  
  next();
});

// Static method to find available drivers near a location
DriverProfileSchema.statics.findAvailableNearLocation = function(
  coordinates: [number, number],
  maxDistance: number = 5000 // 5km default
) {
  return this.find({
    isOnline: true,
    isAvailable: true,
    approved: true,
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Create and export the model
export const DriverProfile: Model<IDriverProfile> = mongoose.model<IDriverProfile>(
  'DriverProfile',
  DriverProfileSchema
);