import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepo } from 'src/database/repo/base.repo';
import {
  PropertyStaffAssignment,
  PropertyStaffAssignmentDocument,
  AssignmentStatus,
} from './schemas/property-staff-assignment.schema';
import {
  IAssignStaffPayload,
  IUnassignStaffPayload,
} from './property-staff-assignment.interface';
import { GetStaffAssignmentsDto } from './dto/property-staff-assignment.dto';

@Injectable()
export class PropertyStaffAssignmentRepo extends BaseRepo<PropertyStaffAssignmentDocument> {
  constructor(
    @InjectModel(PropertyStaffAssignment.name)
    private readonly propertyStaffAssignmentModel: Model<PropertyStaffAssignmentDocument>,
  ) {
    super(propertyStaffAssignmentModel);
  }

  async assignStaff(
    payload: IAssignStaffPayload,
  ): Promise<PropertyStaffAssignmentDocument> {
    // Kiểm tra xem staff đã được assign cho property này chưa (với status active)
    const existingAssignment = await this.propertyStaffAssignmentModel.findOne({
      propertyId: payload.propertyId,
      staffId: payload.staffId,
      status: AssignmentStatus.ACTIVE,
    });

    if (existingAssignment) {
      throw new Error('Staff đã được assign cho property này');
    }

    const assignment = new this.propertyStaffAssignmentModel({
      propertyId: payload.propertyId,
      staffId: payload.staffId,
      assignedBy: payload.assignedBy,
      status: AssignmentStatus.ACTIVE,
      assignedAt: new Date(),
      notes: payload.notes,
    });

    return assignment.save();
  }

  async unassignStaff(
    payload: IUnassignStaffPayload,
  ): Promise<PropertyStaffAssignmentDocument | null> {
    const assignment = await this.propertyStaffAssignmentModel.findOne({
      propertyId: payload.propertyId,
      staffId: payload.staffId,
      status: AssignmentStatus.ACTIVE,
    });

    if (!assignment) {
      throw new Error('Không tìm thấy assignment đang active');
    }

    assignment.status = AssignmentStatus.INACTIVE;
    assignment.unassignedAt = new Date();
    assignment.unassignedBy = payload.unassignedBy;
    assignment.unassignNotes = payload.unassignNotes;

    return assignment.save();
  }

  async getStaffByProperty(
    propertyId: Types.ObjectId,
  ): Promise<PropertyStaffAssignmentDocument[]> {
    return this.propertyStaffAssignmentModel
      .find({
        propertyId,
        status: AssignmentStatus.ACTIVE,
      })
      .populate('staffId', 'name email phone')
      .populate('assignedBy', 'name email')
      .exec();
  }

  async getPropertiesByStaff(
    staffId: Types.ObjectId,
  ): Promise<PropertyStaffAssignmentDocument[]> {
    return this.propertyStaffAssignmentModel
      .find({
        staffId,
        status: AssignmentStatus.ACTIVE,
      })
      .populate('propertyId', 'name type')
      .populate('assignedBy', 'name email')
      .exec();
  }

  async getAssignmentHistory(
    queryDto?: GetStaffAssignmentsDto,
  ): Promise<PropertyStaffAssignmentDocument[]> {
    const { propertyId, staffId, propertyName, staffName, status, page = 1, limit = 10 } = queryDto || {};
    
    // Build aggregation pipeline
    const pipeline = [
      // Lookup property details
      {
        $lookup: {
          from: 'properties',
          localField: 'propertyId',
          foreignField: '_id',
          as: 'property'
        }
      },
      // Lookup staff details  
      {
        $lookup: {
          from: 'users',
          localField: 'staffId',
          foreignField: '_id',
          as: 'staff'
        }
      },
      // Lookup assignedBy details
      {
        $lookup: {
          from: 'users',
          localField: 'assignedBy',
          foreignField: '_id',
          as: 'assignedByUser'
        }
      },
      // Lookup unassignedBy details
      {
        $lookup: {
          from: 'users',
          localField: 'unassignedBy',
          foreignField: '_id',
          as: 'unassignedByUser'
        }
      },
      { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$assignedByUser', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$unassignedByUser', preserveNullAndEmptyArrays: true } }
    ];

    // Build match conditions
    const matchConditions: any = {};
    
    if (propertyId) matchConditions.propertyId = new Types.ObjectId(propertyId);
    if (staffId) matchConditions.staffId = new Types.ObjectId(staffId);
    if (status) matchConditions.status = status;
    
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add name-based filters
    if (propertyName || staffName) {
      const nameMatchConditions: any = {};
      
      if (propertyName) {
        nameMatchConditions['property.name'] = { $regex: propertyName, $options: 'i' };
      }
      
      if (staffName) {
        nameMatchConditions['staff.name'] = { $regex: staffName, $options: 'i' };
      }
      
      pipeline.push({ $match: nameMatchConditions });
    }

    // Add sorting
    pipeline.push({ $sort: { createdAt: -1 } });

    // Add pagination
    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    return this.propertyStaffAssignmentModel.aggregate(pipeline);
  }

  async isStaffAssignedToProperty(
    staffId: Types.ObjectId,
    propertyId: Types.ObjectId,
  ): Promise<boolean> {
    const assignment = await this.propertyStaffAssignmentModel.findOne({
      staffId,
      propertyId,
      status: AssignmentStatus.ACTIVE,
    });
    return !!assignment;
  }
} 