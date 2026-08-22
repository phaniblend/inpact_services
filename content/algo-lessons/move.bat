@echo off
REM Move unverified files to reverify directory
REM Created: December 26, 2024

echo ========================================
echo Moving 20 Unverified Files to Reverify
echo ========================================
echo.

REM Create reverify directory if it doesn't exist
if not exist "C:\INPACT\aptlearn\mentor\lessons\reverify" (
    mkdir "C:\INPACT\aptlearn\mentor\lessons\reverify"
    echo Created directory: reverify
    echo.
)

REM Move files to reverify directory
echo Moving files...
echo.

move "C:\INPACT\aptlearn\mentor\lessons\sqrt-x.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\squares-of-sorted-array.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\subarray-product-less-than-k.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\remove-nth-node.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\reverse-linked-list.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\reverse-string.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\same-tree.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\search-2d-matrix.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\search-insert-position.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\symmetric-tree.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\target-sum.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\three-sum.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\trapping-rain-water.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\two-sum.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\unique-paths.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\valid-anagram.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\valid-palindrome.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\validate-binary-search-tree.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\word-pattern.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"
move "C:\INPACT\aptlearn\mentor\lessons\word-search.json" "C:\INPACT\aptlearn\mentor\lessons\reverify\"

echo.
echo ========================================
echo DONE! 20 files moved to reverify folder
echo ========================================
echo.
echo Next steps:
echo 1. Upload files from reverify folder to Claude
echo 2. Claude will validate all 20 files
echo 3. We'll identify which 4 are extras
echo.

pause