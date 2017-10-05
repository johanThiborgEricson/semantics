describe("Fetching source code...", function() {
  
  var FactoryBackup = InterpreterMethodFactory;
  var factorySourceCode;
  var interpreter = new JavaScriptInterpreter();
  var fileInput;
  
  beforeAll(function(done) {
    function reqListener() {
      document.body.removeChild(fileInput);
      factorySourceCode = this.responseText;
      done();
    }
    
    function fileListener() {
      var fileReader = new FileReader();
      fileReader.addEventListener("load", function() {
        factorySourceCode = fileReader.result;
        done();
      });
      
      fileReader.readAsText(this.files[0]);
    }
    
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.addEventListener("change", fileListener);
    document.body.appendChild(fileInput);
    
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "src/InterpreterMethodFactory.js");
    oReq.send();
  });
  
  if(URL&&new URL(document.location).searchParams.get("inception") != "false"){
    it("compiling...", function() {
      var sandboxWindow = {
        Function: Function,
        RegExp: RegExp,
        Array: Array,
        Object: Object,
        Error: Error,
        console: console,
      };
      
      interpreter.program(factorySourceCode, sandboxWindow);
      InterpreterMethodFactory = sandboxWindow.InterpreterMethodFactory;
      CodePointer = sandboxWindow.CodePointer;
      JavaScriptInterpreter.hack();
      expect(InterpreterMethodFactory).not.toBe(FactoryBackup);
    });
    
  } else {
    it("parsing...", function() {
      expect(function() {
        interpreter.program(factorySourceCode);
      }).not.toThrow();
      
    });
    
  }
  
});
