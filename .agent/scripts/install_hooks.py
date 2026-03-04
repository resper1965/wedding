#!/usr/bin/env python3
import os
from pathlib import Path

def install_hooks():
    project_root = Path(__file__).parent.parent.resolve()
    hooks_dir = project_root / ".git" / "hooks"
    
    if not hooks_dir.exists():
        print("❌ .git/hooks directory not found. Are you in a git repository?")
        return

    pre_commit_path = hooks_dir / "pre-commit"
    
    hook_content = f"""#!/bin/bash
# SSDLC Pre-commit Hook
python3 .agent/scripts/verify_ssdlc.py
"""
    
    with open(pre_commit_path, "w") as f:
        f.write(hook_content)
    
    os.chmod(pre_commit_path, 0o755)
    print(f"✅ SSDLC Pre-commit hook installed at {pre_commit_path}")

if __name__ == "__main__":
    install_hooks()
