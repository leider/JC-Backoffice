const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const Users = beans.get('users');

const user1 = {id: 'user1', name: 'Name of User1', email: 'user1@jazzclub.de', gruppen: ['orgaTeam']};
const user2 = {id: 'user2', name: 'Name of User2', email: 'user2@jazzclub.de', gruppen: ['orgaTeam']};
const user3 = {id: 'user3', name: 'Name of User3', email: 'user3@jazzclub.de', gruppen: ['bookingTeam']};
const user4 = {id: 'user4', name: 'Name of User4', email: 'user4@jazzclub.de', gruppen: ['bookingTeam', 'orgaTeam']};
const user5 = {
  id: 'user5',
  name: 'Name of User5',
  email: 'user5@jazzclub.de',
  gruppen: ['bookingTeam', 'orgaTeam', 'superusers']
};
const user6 = {id: 'user6', name: 'Name of User6', email: 'user6@jazzclub.de', gruppen: ['superusers']};
const user7 = {id: 'user7', name: 'Name of User7', email: 'user7@jazzclub.de', gruppen: []};

const users = new Users([user1, user2, user3, user4, user5, user6, user7]);

describe('Users can extract receivers for mails', () => {
  it('when nothing is provided', () => {
    const groupsFromBody = [];
    const userFromBody = [];
    const result = users.filterReceivers(groupsFromBody, userFromBody);
    expect(result).to.eql([]);
  });

  it('when orgaTeam provided', () => {
    const groupsFromBody = ['orgaTeam'];
    const userFromBody = [];
    const result = users.filterReceivers(groupsFromBody, userFromBody);
    expect(result).to.contain(user1);
    expect(result).to.contain(user2);
    expect(result).to.contain(user4);
    expect(result).to.contain(user5);
    expect(result).to.contain(user6);
  });

  it('when bookingTeam provided', () => {
    const groupsFromBody = ['bookingTeam'];
    const userFromBody = [];
    const result = users.filterReceivers(groupsFromBody, userFromBody);
    expect(result).to.contain(user3);
    expect(result).to.contain(user4);
    expect(result).to.contain(user5);
    expect(result).to.contain(user6);
  });

  it('when orageTeam AND bookingTeam provided', () => {
    const groupsFromBody = ['bookingTeam', 'orgaTeam'];
    const userFromBody = [];
    const result = users.filterReceivers(groupsFromBody, userFromBody);
    expect(result).to.have.length(6);
    expect(result).to.contain(user1);
    expect(result).to.contain(user2);
    expect(result).to.contain(user3);
    expect(result).to.contain(user4);
    expect(result).to.contain(user5);
    expect(result).to.contain(user6);
  });

  it('when any non-existing team provided userFromBody is ignored and superuser always taken', () => {
    const groupsFromBody = ['weired'];
    const userFromBody = ['user1'];
    const result = users.filterReceivers(groupsFromBody, userFromBody);
    expect(result).to.not.contain(user1);
    expect(result).to.contain(user6);
  });

  it('when "alle" provided', () => {
    const groupsFromBody = ['alle'];
    const userFromBody = ['user1'];
    const result = users.filterReceivers(groupsFromBody, userFromBody);
    expect(result).to.contain(user1);
    expect(result).to.contain(user2);
    expect(result).to.contain(user3);
    expect(result).to.contain(user4);
    expect(result).to.contain(user5);
    expect(result).to.contain(user6);
    expect(result).to.contain(user7);
  });

  it('when no team provided userFromBody is taken', () => {
    const groupsFromBody = [];
    const userFromBody = ['user1', 'user4'];
    const result = users.filterReceivers(groupsFromBody, userFromBody);
    expect(result).to.contain(user1);
    expect(result).to.contain(user4);
  });
});

