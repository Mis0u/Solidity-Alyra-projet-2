const voting = artifacts.require("Voting");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const messages = require('../components/test/messages');

contract('Voting', accounts => {
    const owner = accounts[0];
    const firstVoter = accounts[1];

    beforeEach(async () => {
        this.voting = await voting.new({from: owner});
        await this.voting.addVoter(firstVoter, {from: owner});
    })

    describe('test event', () => {
        //Success
        it('should emit ProposalsRegistrationStarted', async () => {
            const startProposal = await this.voting.startProposalsRegistering({from: owner});
            expectEvent(startProposal, messages.event['workflow status'], {previousStatus: messages.enums['registering voters'], newStatus: messages.enums['proposal registration started']});
        })

        it('should emit endProposalsRegistering', async () => {
            await this.voting.startProposalsRegistering({from: owner});
            const endProposal = await this.voting.endProposalsRegistering({from: owner});
            expectEvent(endProposal, messages.event['workflow status'], {previousStatus: messages.enums['proposal registration started'], newStatus: messages.enums['proposal registration ended']});
        })

        it('should emit startVotingSession', async () => {
            await this.voting.startProposalsRegistering({from: owner});
            await this.voting.endProposalsRegistering({from: owner});
            const startVoting = await this.voting.startVotingSession({from: owner});
            expectEvent(startVoting, messages.event['workflow status'], {previousStatus: messages.enums['proposal registration ended'], newStatus: messages.enums['voting session started']});
        })

        it('should emit endVotingSession', async () => {
            await this.voting.startProposalsRegistering({from: owner});
            await this.voting.endProposalsRegistering({from: owner});
            await this.voting.startVotingSession({from: owner});
            const endVoting = await this.voting.endVotingSession({from: owner});
            expectEvent(endVoting, messages.event['workflow status'], {previousStatus: messages.enums['voting session started'], newStatus: messages.enums['voting session ended']});
        })

        //Failed
        it('should revert because not owner', async () => {
            await expectRevert(this.voting.startProposalsRegistering({from: firstVoter}), messages.error['not owner']);
            await expectRevert(this.voting.endProposalsRegistering({from: firstVoter}), messages.error['not owner']);
            await expectRevert(this.voting.startVotingSession({from: firstVoter}), messages.error['not owner']);
            await expectRevert(this.voting.endVotingSession({from: firstVoter}), messages.error['not owner']);
        })

        it('should revert because proposal has not started', async () => {
            await this.voting.startProposalsRegistering({from: owner});
            await this.voting.endProposalsRegistering({from: owner});
            await expectRevert(this.voting.startProposalsRegistering({from: owner}), messages.error['registering proposals not started now']);
        })

        it('should emit endProposalsRegistering', async () => {
            await expectRevert(this.voting.endProposalsRegistering({from: owner}), messages.error['registering proposals not started yet']);
        })

        it('should emit startVotingSession', async () => {
            await expectRevert(this.voting.startVotingSession({from: owner}), messages.error['registering phase not finished']);
        })

        it('should emit endVotingSession', async () => {
            await expectRevert(this.voting.endVotingSession({from: owner}), messages.error['voting session starting']);
        })
    })
})