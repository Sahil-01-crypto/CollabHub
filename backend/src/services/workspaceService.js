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

module.exports = {
    createWorkspace,
    getUserWorkspaces
};
