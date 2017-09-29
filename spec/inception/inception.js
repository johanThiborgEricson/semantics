describe("Fetching source code...", function() {
  
  var FactoryBackup = window.InterpreterMethodFactory;
  var factorySourceCode;
  var interpreter = new JavaScriptInterpreter();
  
  beforeAll(function(done) {
    function reqListener() {
      factorySourceCode = this.responseText;
      done();
    }
    
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "src/InterpreterMethodFactory.js");
    oReq.send();
  });
  
  xit("compiling...", function() {
    interpreter.program(factorySourceCode, window);
    expect(window.InterpreterMethodFactory).not.toBe(FactoryBackup);
  });
  
});
