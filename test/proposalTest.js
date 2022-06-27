const voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const messages = require('../components/test/messages');

contract('Voting', accounts => {
    const owner = accounts[0];
    const firstVoter = accounts[1];
    const unknownUser = accounts[2];

    const proposalDescription = 'this is a proposal ';

    beforeEach(async () => {
        this.voting = await voting.new({from: owner});
        await this.voting.addVoter(firstVoter, {from: owner});
    })

    describe('test getOneProposal/addProposal', () => {

        beforeEach(async () => {
            await this.voting.startProposalsRegistering({from: owner});
        })

        // AddProposal
        it('should revert because proposal is not allowed', async () => {
            await this.voting.endProposalsRegistering({from: owner});
            await expectRevert(this.voting.addProposal(proposalDescription, {from: firstVoter}), messages.error['proposal not allowed']);
        })

        it('should revert because not a voter', async () => {
            await expectRevert(this.voting.addProposal(proposalDescription, {from: unknownUser}), messages.error['not voter']);
        })

        it('should revert because blank proposal submit', async () => {
            await expectRevert(this.voting.addProposal('', {from: firstVoter}), messages.error['blank proposal']);
        })

        it('should emit an event after proposal', async () => {
            const addProposal = await this.voting.addProposal(proposalDescription, {from: firstVoter});
            expectEvent(addProposal, messages.event['proposal registered'], {proposalId: new BN(0)} );
        })

        //GetOneProposal
        it('should revert because is not a voter', async () => {
            await expectRevert(this.voting.getOneProposal(firstVoter, {from: unknownUser}), messages.error['not voter']);
         });

        it('should get information proposal', async () => {
            await this.voting.addProposal(proposalDescription, {from: firstVoter});
            const storeData = await this.voting.getOneProposal(0, {from: firstVoter});
            expect(storeData.description).to.be.equal(proposalDescription);
            expect(new BN(storeData.voteCount)).to.be.bignumber.equal(new BN(0));
        });
    })
})