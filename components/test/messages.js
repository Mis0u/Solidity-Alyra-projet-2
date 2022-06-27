const error = {
    'not owner': 'Ownable: caller is not the owner',
    'not voter': 'You\'re not a voter',
    'registration not open': 'Voters registration is not open yet',
    'already registered': 'Already registered',
    'proposal not allowed': 'Proposals are not allowed yet',
    'blank proposal': 'Vous ne pouvez pas ne rien proposer',
    'voting session starting': 'Voting session havent started yet',
    'already voted': 'You have already voted',
    'proposal not found': 'Proposal not found',
    'voting session ending': 'Current status is not voting session ended',
    'registering proposals not started now': 'Registering proposals cant be started now',
    'registering proposals not started yet': 'Registering proposals havent started yet',
    'registering phase not finished': 'Registering proposals phase is not finished',
};

const event = {
    'voter registered': 'VoterRegistered',
    'proposal registered': 'ProposalRegistered',
    'voted': 'Voted',
    'workflow status': 'WorkflowStatusChange',
}

const enums = {
    'registering voters': '0',
    'proposal registration started': '1',
    'proposal registration ended': '2',
    'voting session started': '3',
    'voting session ended': '4',
    'votes tallied': '5',
}

module.exports = {
    error,
    event,
    enums
  };