describe("The source code of CodePointer.js", function() {
  
  var CodePointerBackup;
  var codePointerSourceCode;
  var interpreter = new JavaScriptInterpreter();
  
  beforeEach(function(done) {
    CodePointerBackup = window.CodePointer;
    function reqListener () {
      codePointerSourceCode = this.responseText;
      done();
    }
    
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "src/CodePointer.js");
    oReq.send();
  });
  
  afterEach(function() {
    window.CodePointer = CodePointerBackup;
    delete window.codePointerSourceCode;
  });
  
  it("can be loaded by an XMLHttpRequest", function() {
    expect(codePointerSourceCode).toBeDefined();
  });
  
  it("can be run by the JavaScriptInterpreter", function() {
    expect(function() {
      interpreter.program(codePointerSourceCode);
    }).not.toThrow();
  });
  
});
