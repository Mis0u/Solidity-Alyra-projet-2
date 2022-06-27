
# Prérequis
* Avoir truffle d'installer
* Avoir ganacche d'installer


# Installation

Pour installer ce projet, veuillez effectuer un git clone du repository dans un nouveau dossier.

Une fois le repository téléchargé, vous pouvez installer les dépendances en effectuant 
`npm install` ou `yarn install` selon vos préférences.

## Documentation

### Ganache

Que ce soit en CLI ou par l'interface, vous devez lancer Ganache dans votre console.

### Truffle

Une fois que Ganache est lancé, vous pouvez effectue la migration en lançant la commande :

```bash
  truffle migrate
```
Puis vous pouvez lancer les tests avec : 

```bash
  truffle test
```

## Appendice

Pour ce projet, il est question de mettre en évidence nos compétences pour tester nos contrats. 
En l'occurence ici il va s'agir d'un contrat `Voting.sol`

### Les tests

Le tests ont été réparti en plusieurs fichiers qui vont tester 
séparemment les fonctions d'une même 'famille'.
Par exemple le fichier `VoterTest.js` va tester les fonctions :
* `addVoter`
* `getVoter`
* `setVote`

Le nom des fichiers JS expriment bien ce qu'ils vont tester.

Ensuite chaque test va d'abord examiner :
* Les Requires
* Les events
* Le bon rendu de la fonction

Voici un exemple avec le fichier `VoterTest.js` dans lequel je test la fonction `setVote` :

#### Test d'un require :
```javascript
it('should revert because not voter', async () => {
    await expectRevert(this.voting.setVote(0, {from: unknownUser}), messages.error['not voter']);
})
```

#### Test de l'émission de l'évènement :
```javascript
it('should emit an event after vote', async () => {
    const addVote = await this.voting.setVote(0, {from: firstVoter});
    expectEvent(addVote, 'Voted', {voter: firstVoter, proposalId: new BN(0)} );
})
```
#### Test du bon fonctionnement de la fonction :
```javascript
it('should get information voter', async () => {
    await this.voting.setVote(1, {from: firstVoter})
    const storeData = await this.voting.getVoter(firstVoter, {from: firstVoter});
    expect(storeData.isRegistered).to.be.true;
    expect(storeData.hasVoted).to.be.true;
    expect(new BN(storeData.votedProposalId)).to.be.bignumber.equal(new BN(1));

    const proposalData = await this.voting.getOneProposal(0, {from: firstVoter});
    expect(proposalData.description).to.be.equal(proposalDescription);

    const secondProposalData = await this.voting.getOneProposal(1, {from: firstVoter});
    expect(secondProposalData.description).to.be.equal(proposalSecondDescription);
})
```



## Authors

- [@mickaelmisiti](https://github.com/Mis0u)

