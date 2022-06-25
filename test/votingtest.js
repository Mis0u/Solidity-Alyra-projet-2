const voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const owner = accounts[0];
    const firstVoter = accounts[1];
    const secondVoter = accounts[2];
    const unknownUser = accounts[3];

    const errorNotOwner = "Ownable: new owner is the zero address";
    const errorNotVoter = "You're not a voter";
    const errorRegistrationNotOpen = "Voters registration is not open yet";
    const errorVoterAlreadyRegistered = 'Already registered';
    const errorProposalAreNotAllowed = 'Proposals are not allowed yet'
    const errorBlankProposal = 'Vous ne pouvez pas ne rien proposer';

    const event = "VoterRegistered";

    beforeEach(async () => {
        this.voting = await voting.new({from: owner});
        await this.voting.addVoter(firstVoter, {from: owner});
    })

    describe('test addVoter/getVoter', () => {

        // AddVoter
        it('should revert because registration is not open', async () => {
            await this.voting.startProposalsRegistering({from: owner});
            await expectRevert(this.voting.addVoter(secondVoter, {from: owner}), errorRegistrationNotOpen);
        })

        it('should revert because voter is already registered', async () => {
            await expectRevert(this.voting.addVoter(firstVoter, {from: owner}), errorVoterAlreadyRegistered);
        })

        it('should emit an event after registration', async () => {
            const addSecondVoter = await this.voting.addVoter(secondVoter, {from: owner});
            expectEvent(addSecondVoter, 'VoterRegistered' );
        })
        // GetVoter
        it('should revert because is not a voter', async () => {
            await expectRevert(this.voting.getVoter(firstVoter, {from: unknownUser}), errorNotVoter);
         });

        it('should get information voter', async () => {
            await this.voting.addVoter(secondVoter, {from: owner});
            const storeData = await this.voting.getVoter(secondVoter, {from: firstVoter});
            expect(storeData.isRegistered).to.be.true;
            expect(storeData.hasVoted).to.be.false;
            expect(new BN(storeData.votedProposalId)).to.be.bignumber.equal(new BN('0'));
        });
    });

    /* describe('test addVoter', () =>  {
         it('should revert because is not the owner', async () => {
            await expectRevert(this.voting.addVoter(secondVoter, {from: unknownUser}), errorNotOwner);
        }) 

        
    }) */

    describe('test getOneProposal/addProposal', () => {
        const proposalDescription = 'test';

        beforeEach(async () => {
            await this.voting.startProposalsRegistering({from: owner});
        })

        // AddProposal
        it('should revert because proposal is not allowed', async () => {
            await this.voting.endProposalsRegistering({from: owner});
            await expectRevert(this.voting.addProposal(proposalDescription, {from: firstVoter}), errorProposalAreNotAllowed);
        })

        it('should revert because blank proposal submit', async () => {
            await expectRevert(this.voting.addProposal('', {from: firstVoter}), errorBlankProposal);
        })

        it('should emit an event after proposal', async () => {
            const addSecondVoter = await this.voting.addProposal(proposalDescription, {from: firstVoter});
            expectEvent(addSecondVoter, 'ProposalRegistered' );
        })
    })

})