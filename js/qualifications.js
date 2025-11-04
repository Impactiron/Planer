/**
 * Qualifications Module - Team member qualification and assignment logic
 */

let qualificationsData = null;

/**
 * Load qualifications data from JSON file
 */
async function loadQualifications() {
    try {
        const response = await fetch('data/qualifications.json');
        qualificationsData = await response.json();
        console.log('Qualifications loaded:', qualificationsData);
        return qualificationsData;
    } catch (error) {
        console.error('Error loading qualifications:', error);
        return null;
    }
}

/**
 * Get all available task types
 */
function getTaskTypes() {
    if (!qualificationsData) return [];
    return Object.keys(qualificationsData.qualifications);
}

/**
 * Get qualified team members for a specific task type
 */
function getQualifiedMembers(taskType) {
    if (!qualificationsData || !taskType) return [];
    return qualificationsData.qualifications[taskType] || [];
}

/**
 * Assign a qualified team member to a task based on workload
 */
function assignTeamMember(task, scheduledDate) {
    const taskType = task.taskType || task.type;
    
    if (!taskType) {
        console.warn('Task has no type, cannot assign team member');
        return null;
    }
    
    const qualifiedMembers = getQualifiedMembers(taskType);
    
    if (qualifiedMembers.length === 0) {
        console.warn(`No qualified members found for task type: ${taskType}`);
        return null;
    }
    
    // Get workload for each qualified member
    const memberWorkload = {};
    qualifiedMembers.forEach(member => {
        memberWorkload[member] = getTaskCountForMember(member, scheduledDate);
    });
    
    // Find member with least workload
    let bestMember = qualifiedMembers[0];
    let minWorkload = memberWorkload[bestMember];
    
    for (const member of qualifiedMembers) {
        if (memberWorkload[member] < minWorkload) {
            bestMember = member;
            minWorkload = memberWorkload[member];
        }
    }
    
    return bestMember;
}

/**
 * Get task count for a specific team member on a given date
 */
function getTaskCountForMember(memberName, date) {
    const allTasks = getAllTasks();
    
    return allTasks.filter(task => 
        task.assignedTo === memberName && 
        task.scheduledDate === date
    ).length;
}

/**
 * Get team member details
 */
function getTeamMemberDetails(memberName) {
    if (!qualificationsData || !memberName) return null;
    return qualificationsData.teamMembers[memberName] || null;
}

/**
 * Get all team members
 */
function getAllTeamMembers() {
    if (!qualificationsData) return [];
    return Object.values(qualificationsData.teamMembers);
}

/**
 * Check if a team member is qualified for a task type
 */
function isQualified(memberName, taskType) {
    const qualifiedMembers = getQualifiedMembers(taskType);
    return qualifiedMembers.includes(memberName);
}