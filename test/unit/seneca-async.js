import seneca from '../../src/seneca-async';

describe('seneca', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(seneca, 'greet');
      seneca.greet();
    });

    it('should have been run once', () => {
      expect(seneca.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(seneca.greet).to.have.always.returned('hello');
    });
  });
});
