from typing import Optional, TextIO

def getpass(prompt: str = ..., stream: Optional[TextIO] = ...) -> str: ...
def getuser() -> str: ...

class GetPassWarning(UserWarning): ...
