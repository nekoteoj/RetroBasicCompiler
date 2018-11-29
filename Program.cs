using System;
using System.IO;

namespace RetroBasicCompiler
{
    class Program
    {
        static void Main(string[] args)
        {
            // Start program reading input file
            if (args.Length != 1)
            {
                Console.WriteLine("Please provide file path as a parameter.");
                Environment.Exit(1);
            }
            StreamReader file = null;
            try
            {
                file = new StreamReader(args[0]);
            }
            catch (FileNotFoundException)
            {
                Console.WriteLine("Error Open file!");
                Environment.Exit(1);
            }
            var scanner = new Scanner(file);

            string s;
            while ((s = scanner.NextToken()) != null)
            {
                Console.Write($"{s} ");
            }

            // Close file before exit
            if (file != null)
            {
                file.Close();
            }
            file.Close();
        }
    }
}
