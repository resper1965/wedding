#!/usr/bin/env python3
"""
Fast SSDLC Gate - MarryFlow
===========================
Runs CRITICAL security and quality checks for pre-commit or fast CI.
"""
import sys
import subprocess
from pathlib import Path

def run_check(name, cmd):
    print(f"🔄 Running {name}...")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {name} PASSED")
            return True
        else:
            print(f"❌ {name} FAILED")
            print(result.stdout)
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ {name} ERROR: {str(e)}")
        return False

def main():
    project_root = Path(__file__).parent.parent.resolve()
    success = True

    # 1. Security Scan
    if not run_check("Security Scan", ["python3", ".agent/skills/vulnerability-scanner/scripts/security_scan.py", str(project_root)]):
        success = False

    # 2. Lint Check
    if not run_check("Lint Check", ["python3", ".agent/skills/lint-and-validate/scripts/lint_runner.py", str(project_root)]):
        success = False

    # 3. Test Suite (Critical Only)
    # Note: Using subset of tests if available, otherwise full unit suite
    if not run_check("Unit Tests", ["python3", ".agent/skills/testing-patterns/scripts/test_runner.py", str(project_root)]):
        success = False

    if not success:
        print("\n🛑 SSDLC GATES FAILED. Please fix issues before committing.")
        sys.exit(1)
    
    print("\n✨ SSDLC GATES PASSED. Ready to commit.")
    sys.exit(0)

if __name__ == "__main__":
    main()
