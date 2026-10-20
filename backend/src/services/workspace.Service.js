const mongoose = require('mongoose');

const workspaceModel = require('../model/workspace.model');
const WorkspaceMember = require('../model/workspaceMember.model');

const createWorkspace = async ({ name, description, userId }) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const [workspace] = await workspaceModel.create(
            [
                {
                    name,
                    description,
                    owner: userId
                }
            ],
            { session }
        );

        await WorkspaceMember.create(
            [
                {
                    workspace: workspace._id,
                    user: userId,
                    role: 'OWNER'
                }
            ],
            { session }
        );

        await session.commitTransaction();

        return workspace;
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;
    } finally {
        await session.endSession();
    }
};

const getUserWorkspaces = async (userId) => {
    const memberships = await WorkspaceMember
        .find({ user: userId })
        .select("workspace");

    const workspaceIds = memberships.map(
        (membership) => membership.workspace
    );

    const workspaces = await workspaceModel.find({
        _id: { $in: workspaceIds }
    });

    return workspaces;
};

const getWorkspaceById = async ({ workspaceId  , userId }) => {

    const membership = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: userId
    });

    
if (!membership) {
    const error = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
}

    if( membership === null) {
        throw new Error("Workspace not found");
    }

    const workspace  = await workspaceModel.findOne({_id: membership.workspace});

    if(!workspace) {
        throw new Error("Workspace not found");
    }


  

    return workspace;
};

const updateWorkspace = async ({ workspaceId, userId, name, description }) => {
    const membership = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: userId
    });

    if(!membership) {
        throw new Error("Workspace not found");
    }
    if( membership.role === 'OWNER'  || membership.role === 'ADMIN') {
        const updatedWorkspace = await workspaceModel.findOneAndUpdate(
            { _id: workspaceId },
            { $set: { name, description } },
            { new: true }
        );

        if (!updatedWorkspace) {
            throw new Error("Workspace not found");
        }

            return updatedWorkspace;
    }
    else{
        throw new Error("You do not have permission to update this workspace");
    }
}

const deleteWorkspaceService = async ({ workspaceId, userId }) => {
    // 1. Validate workspace ID
    if (!mongoose.isValidObjectId(workspaceId)) {
        const error = new Error("Invalid workspace ID");
        error.statusCode = 400;
        throw error;
    }

    // 2. Start a MongoDB transaction
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 3. Verify workspace membership
        const membership = await WorkspaceMember.findOne({
            workspace: workspaceId,
            user: userId
        }).session(session);

        if (!membership) {
            const error = new Error("Workspace not found");
            error.statusCode = 404;
            throw error;
        }

        // 4. Only the OWNER can delete the workspace
        if (membership.role !== "OWNER") {
            const error = new Error(
                "You do not have permission to delete this workspace"
            );
            error.statusCode = 403;
            throw error;
        }

        // 5. Delete the workspace
        const deletedWorkspace = await workspaceModel.findByIdAndDelete(
            workspaceId,
            { session }
        );

        if (!deletedWorkspace) {
            const error = new Error("Workspace not found");
            error.statusCode = 404;
            throw error;
        }

        // 6. Delete all associated memberships
        await WorkspaceMember.deleteMany(
            { workspace: workspaceId },
            { session }
        );

        // 7. Commit the transaction
        await session.commitTransaction();

        return deletedWorkspace;

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;

    } finally {
        await session.endSession();
    }
};


// WORKSPACEMEMBER SERVICE


module.exports = {
    createWorkspace,
    getUserWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace: deleteWorkspaceService,
    
};
