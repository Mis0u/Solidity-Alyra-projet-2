const voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const messages = require('../components/test/messages');

contract('Voting', accounts => {
    const owner = accounts[0];
    const firstVoter = accounts[1];
    const secondVoter = accounts[2];
    const unknownUser = accounts[3];

    beforeEach(async () => {
        this.voting = await voting.new({from: owner});
        await this.voting.addVoter(firstVoter, {from: owner});
    })

    describe('test addVoter/getVoter', () => {

        // AddVoter
        it('should revert because not owner', async () => {
            await expectRevert(this.voting.addVoter(secondVoter,{from: firstVoter}), messages.error['not owner']);
        })
        
        it('should revert because registration is not open', async () => {
            await this.voting.startProposalsRegistering({from: owner});
            await expectRevert(this.voting.addVoter(secondVoter, {from: owner}), messages.error['registration not open']);
        })

        it('should revert because voter is already registered', async () => {
            await expectRevert(this.voting.addVoter(firstVoter, {from: owner}), messages.error['already registered']);
        })

        it('should emit an event after registration', async () => {
            const addSecondVoter = await this.voting.addVoter(secondVoter, {from: owner});
            expectEvent(addSecondVoter, 'VoterRegistered', { voterAddress: secondVoter} );
        })
        // GetVoter
        it('should revert because is not a voter', async () => {
            await expectRevert(this.voting.getVoter(firstVoter, {from: unknownUser}), messages.error['not voter']);
         });

        it('should get information voter', async () => {
            await this.voting.addVoter(secondVoter, {from: owner});
            const storeData = await this.voting.getVoter(secondVoter, {from: firstVoter});
            expect(storeData.isRegistered).to.be.true;
            expect(storeData.hasVoted).to.be.false;
            expect(new BN(storeData.votedProposalId)).to.be.bignumber.equal(new BN(0));
        });
    });

    describe('test setVote', () =>  {
        const proposalDescription = 'this is a proposal ';
        const proposalSecondDescription = 'this is an other proposal ';

        beforeEach(async () => {
            await this.voting.startProposalsRegistering({from: owner});

            await this.voting.addProposal(proposalDescription, {from: firstVoter});
            await this.voting.addProposal(proposalSecondDescription, {from: firstVoter});

            await this.voting.endProposalsRegistering({from: owner});
            await this.voting.startVotingSession({from: owner});
        })

        it('should revert because not voter', async () => {
            await expectRevert(this.voting.setVote(0, {from: unknownUser}), messages.error['not voter']);
        })

        it('should revert because voting sessions hasn\'t started', async () => {
            await this.voting.endVotingSession({from: owner});
            await expectRevert(this.voting.setVote(0, {from: firstVoter}), messages.error['voting session starting']);
        })

        it('should revert because already voted', async () => {
            await this.voting.setVote(0,{from: firstVoter});
            await expectRevert(this.voting.setVote(0, {from: firstVoter}), messages.error['already voted']);
        })

        it('should revert because proposal not found', async () => {
            await expectRevert(this.voting.setVote(2, {from: firstVoter}), messages.error['proposal not found']);
        })

        it('should get information voter', async () => {
            await this.voting.setVote(1, {from: firstVoter})
            const storeData = await this.voting.getVoter(firstVoter, {from: firstVoter});
            expect(storeData.isRegistered).to.be.true;
            expect(storeData.hasVoted).to.be.true;
            expect(new BN(storeData.votedProposalId)).to.be.bignumber.equal(new BN(1));

            const proposalData = await this.voting.getOneProposal(0, {from: firstVoter});
            expect(proposalData.description).to.be.equal(proposalDescription);
        })

        it('should emit an event after vote', async () => {
            const addVote = await this.voting.setVote(0, {from: firstVoter});
            expectEvent(addVote, 'Voted', {voter: firstVoter, proposalId: new BN(0)} );
        })
    })

})