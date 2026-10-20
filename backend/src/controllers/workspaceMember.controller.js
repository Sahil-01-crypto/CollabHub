const {
    getWorkspaceMembers: getWorkspaceMembersService,
    addWorkspaceMember: addWorkspaceMemberService,
    updateWorkspaceMemberRole: updateWorkspaceMemberRoleService,
    removeWorkspaceMember: removeWorkspaceMemberService
} = require("../services/workspaceMember.Service");




const getWorkspaceMembers = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const members = await getWorkspaceMembersService({
            workspaceId,
            userId: req.user.id
        });

        return res.status(200).json({
            message: "Workspace members fetched successfully",
            members
        });

    } catch (error) {
        console.error("Error fetching workspace members:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};

const addWorkspaceMember = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { memberEmail } = req.body;

        const newMember = await addWorkspaceMemberService({
            workspaceId,
            userId: req.user.id,
            memberEmail
        });

        return res.status(201).json({
            message: "Member added successfully",
            member: newMember
        });

    } catch (error) {
        console.error("Error adding workspace member:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};

const updateWorkspaceMemberRole = async (req, res) => {
    try{
        const { workspaceId, memberId } = req.params;
        const { newRole } = req.body;

        const  updatedMember = await updateWorkspaceMemberRoleService({
            workspaceId,
            memberId,
            userId: req.user.id,
            role:newRole
        });


        return res.status(200).json({
            message: "Member role updated successfully",
            member: updatedMember
        });
    } catch (error) {
        console.error("Error updating workspace member role:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }

}

const removeWorkspaceMember = async (req, res) => {
    try {
        const { workspaceId, memberId } = req.params;

        const removedMember = await removeWorkspaceMemberService({
            workspaceId,
            memberId,
            userId: req.user.id
        });

        return res.status(200).json({
            message: "Member removed successfully",
            member: removedMember
        });

    } catch (error) {
        console.error("Error removing workspace member:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};
module.exports = {
    getWorkspaceMembers,
    addWorkspaceMember,
    updateWorkspaceMemberRole,
    removeWorkspaceMember
};

