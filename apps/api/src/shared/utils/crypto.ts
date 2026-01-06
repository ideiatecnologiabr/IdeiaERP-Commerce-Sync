/**
 * Descriptografa uma string usando o algoritmo XOR com chave
 * Compatível com o algoritmo CriptografiaString do Delphi/IdeiaERP
 * 
 * Algoritmo Delphi original:
 * ```delphi
 * function CriptografiaString(Valor,Chave: string): string;
 * var
 *   i, TamanhoString, pos, PosLetra, TamanhoChave: Integer;
 * begin
 *   Result := Trim(Valor);
 *   Valor := Trim(Valor);
 *   TamanhoString := Length(Valor);
 *   TamanhoChave := Length(Chave);
 *   for i := 1 to TamanhoString do
 *   begin
 *     pos := (i mod TamanhoChave);
 *     if pos = 0 then
 *       pos := TamanhoChave;
 *     posLetra := ord(Result[i]) xor ord(Chave[pos]);
 *     if posLetra = 0 then
 *       posLetra := ord(Result[i]);
 *     Result[i] := chr(posLetra);
 *   end;
 * end;
 * ```
 * 
 * @param valor - String criptografada
 * @param chave - Chave de descriptografia (ex: 'S-IDEIA')
 * @returns String descriptografada
 */
export function decryptString(valor: string, chave: string): string {
  if (!valor || !chave) {
    return valor;
  }

  const valorTrimmed = valor.trim();
  const tamanhoString = valorTrimmed.length;
  const tamanhoChave = chave.length;
  let result = '';

  // Delphi usa índices 1-based (for i := 1 to), JavaScript usa 0-based
  for (let i = 0; i < tamanhoString; i++) {
    // Calcula posição na chave (circular, 1-based como no Delphi)
    let pos = ((i + 1) % tamanhoChave);
    if (pos === 0) {
      pos = tamanhoChave;
    }
    
    // XOR dos códigos ASCII (pos - 1 porque arrays JS são 0-based)
    const charCode = valorTrimmed.charCodeAt(i);
    const keyCode = chave.charCodeAt(pos - 1);
    let posLetra = charCode ^ keyCode;
    
    // Se resultado for 0, mantém o caractere original
    if (posLetra === 0) {
      posLetra = charCode;
    }
    
    result += String.fromCharCode(posLetra);
  }

  return result;
}

/**
 * Descriptografa senha do IdeiaERP usando a chave padrão 'S-IDEIA'
 * @param senhaCriptografada - Senha criptografada do config.ini
 * @returns Senha descriptografada
 */
export function decryptIdeiaPassword(senhaCriptografada: string): string {
  return decryptString(senhaCriptografada, 'S-IDEIA');
}

