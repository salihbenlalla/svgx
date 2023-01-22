cat >lib/cjs/package.json <<!EOF
{
    "type": "commonjs"
}
!EOF

cat >lib/esm/package.json <<!EOF
{
    "type": "module"
}
!EOF

echo "/// <reference types=\"./modules\" />\n$(cat lib/index.d.ts)" > lib/index.d.ts
cat lib/index.d.ts
cat src/modules.d.ts >> lib/modules.d.ts