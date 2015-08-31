import Seneca from '../../src/seneca';

const seneca = new Seneca();

describe('seneca', () => {
  it('should be defined', () => {
    expect(seneca).to.not.equal(undefined)
  });
});
