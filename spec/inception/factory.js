describe("The source code of InterpreterMethodFactory.js", function() {
  
  var InterpreterMethodFactoryBackup;
  var factorySourceCode;
  var interpreter = new JavaScriptInterpreter();
  
  beforeEach(function(done) {
    InterpreterMethodFactoryBackup = window.InterpreterMethodFactory;
    function reqListener() {
      factorySourceCode = this.responseText;
      done();
    }
    
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "src/InterpreterMethodFactory.js");
    oReq.send();
  });
  
  afterEach(function() {
    window.InterpreterMethodFactory = InterpreterMethodFactoryBackup;
    delete window.factorySourceCode;
  });
  
  it("can be loaded by an XMLHttpRequest", function() {
    expect(factorySourceCode).toBeDefined();
  });
  
  it("can be run by the JavaScriptInterpreter", function() {
    expect(function() {
      interpreter.program(factorySourceCode);
    }).not.toThrow();
  });
  
});
