const voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const messages = require('../components/test/messages');

contract('Voting', accounts => {
    const owner = accounts[0];
    const firstVoter = accounts[1];
    const secondVoter = accounts[2];
    const thirdVoter = accounts[4];

    beforeEach(async () => {
        this.voting = await voting.new({from: owner});
        await this.voting.addVoter(firstVoter, {from: owner});
    })

    describe('test tallyVotes', () => {
        const proposalFromFirstVoter = 'First voter proposal';
        const proposalFromSecondVoter = 'Second voter proposal';
        const proposalFromThirdVoter = 'Third voter proposal';

        beforeEach(async () => {
            await this.voting.addVoter(secondVoter, {from: owner});
            await this.voting.addVoter(thirdVoter, {from: owner});

            await this.voting.startProposalsRegistering({from: owner});

            await this.voting.addProposal(proposalFromFirstVoter, {from: firstVoter});
            await this.voting.addProposal(proposalFromSecondVoter, {from: secondVoter});
            await this.voting.addProposal(proposalFromThirdVoter, {from: thirdVoter});

            await this.voting.endProposalsRegistering({from: owner});
            await this.voting.startVotingSession({from: owner});

            await this.voting.setVote(1, {from: firstVoter});
            await this.voting.setVote(1, {from: secondVoter});
            await this.voting.setVote(0, {from: thirdVoter});
        })

        it('should revert because not owner', async () => {
            await expectRevert(this.voting.tallyVotes({from: firstVoter}), messages.error['not owner']);
        })

        it('should revert because voting session is not ending', async () => {
            await expectRevert(this.voting.tallyVotes({from: owner}), messages.error['voting session ending']);
        })

        it('should emit WorkflowStatus event', async () => {
            await this.voting.endVotingSession({from: owner});
            const voteTallied = await this.voting.tallyVotes({from: owner});
            expectEvent(voteTallied, messages.event['workflow status'], {previousStatus: messages.enums['voting session ended'], newStatus: messages.enums['votes tallied']});
        })

        it('should display the winning proposal', async () => {
            await this.voting.endVotingSession({from: owner});
            await this.voting.tallyVotes({from: owner});
            const storeDataWinningProposal = await this.voting.winningProposalID.call();
            expect(new BN(storeDataWinningProposal)).to.be.bignumber.equal(new BN(1));

            const storeDataProposal = await this.voting.getOneProposal(1, {from: firstVoter});
            expect(storeDataProposal.description).to.be.equal(proposalFromSecondVoter);
            expect(new BN(storeDataProposal.voteCount)).to.be.bignumber.equal(new BN(2));
        })
    })

})