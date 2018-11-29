using System.IO;

namespace RetroBasicCompiler
{
    public class Scanner
    {
        private StreamReader _file;
        private string[] _lineTokens = {};
        private int _index = 0;

        public Scanner(StreamReader file) => _file = file;

        public string NextToken()
        {
            string line;
            if (_index == _lineTokens.Length)
            {
                line = _file.ReadLine();
                if (line == null)
                {
                    return null;
                }
                _lineTokens = line.Split(" ");
                _index = 0;
            }
            return _lineTokens[_index++];
        }
    }
}