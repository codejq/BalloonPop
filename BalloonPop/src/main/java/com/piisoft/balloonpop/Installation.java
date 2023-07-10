package com.piisoft.balloonpop;

import android.content.Context;

import java.io.BufferedReader;
import java.io.EOFException;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.RandomAccessFile;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

import android.os.AsyncTask;
import android.os.Environment;
import android.provider.Settings.Secure;
import android.util.Log;
import android.widget.Toast;


/**
 * Created by a on 7/19/2016.
 */
public class Installation  {
    private static String sID = null;
    private static final String INSTALLATION = "INSTALLATION";
    private   long sremaningTime = 0;
    private static  Context context;
    private File fileLocation ;
    public  Installation(Context context){
       this.context =  context;
        fileLocation = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File installationTest = new File(fileLocation , "INSTALLATIONTEST");
        try {
            if (!installationTest.exists())
                checkwriting(installationTest, context);
        } catch (Exception e) {
            fileLocation = context.getFilesDir();
        }
    }



    public synchronized  String id(Context context) {
        if (sID == null) {
            File installation = new File( fileLocation, INSTALLATION);
            try {
                if (!installation.exists())
                    writeInstallationFile(installation,context);
                sID = readInstallationFile(installation);
                sID = sID.split(",")[0];
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return sID;
    }


    public synchronized  long remaningTime(Context context) {
        if (sremaningTime == 0) {
            File installation = new File(fileLocation, INSTALLATION);
            try {
                if (!installation.exists())
                    writeInstallationFile(installation,context);
                sID = readInstallationFile(installation);
                sremaningTime = Long.valueOf(sID.split(",")[1]);
                if(sremaningTime == 4547070){
                    return sremaningTime;
                }
                long currentTime = System.currentTimeMillis() / 1000L;
                sremaningTime = sremaningTime - currentTime;
                if(sremaningTime < 0){
                    sremaningTime = 0;
                }
            } catch (Exception e) {

            }
        }
        return sremaningTime;
    }


    private static String readInstallationFile(File installation) throws IOException {
        RandomAccessFile f = new RandomAccessFile(installation, "r");
        byte[] bytes = new byte[(int) f.length()];
        f.readFully(bytes);
        f.close();
        return new String(bytes);
    }

    private static void writeInstallationFile(File installation,Context context) throws IOException {
        FileOutputStream out = new FileOutputStream(installation);
        String id =  Secure.getString(context.getContentResolver(), Secure.ANDROID_ID);
        long currentTime = System.currentTimeMillis() / 1000L;
        long expriationTime =  currentTime + (180 * 86400);
        id = id + "," + expriationTime;
        out.write(id.getBytes());
        out.close();
    }



    private static void checkwriting(File installationTest,Context context) throws IOException {
        FileOutputStream out = new FileOutputStream(installationTest);
        String id =  Secure.getString(context.getContentResolver(), Secure.ANDROID_ID);
        long currentTime = System.currentTimeMillis() / 1000L;
        long expriationTime =  currentTime + (180 * 86400);
        id = id + "," + expriationTime;
        out.write(id.getBytes());
        out.close();
    }

    private  void activate() throws IOException {
        File installation = new File(fileLocation, INSTALLATION);
        try {
            if (installation.exists())
                installation.delete();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        FileOutputStream out = new FileOutputStream(installation);
        String id =  Secure.getString(context.getContentResolver(), Secure.ANDROID_ID);
        id = id + ",4547070" ;
        out.write(id.getBytes());
        out.close();
    }

    public class GetMethodDemo extends AsyncTask<String , Void ,String> {
        String server_response="";

        @Override
        protected String doInBackground(String... strings) {

            URL url;
            HttpURLConnection urlConnection = null;

            try {
                url = new URL(strings[0]);
                urlConnection = (HttpURLConnection) url.openConnection();

                int responseCode = urlConnection.getResponseCode();

                if(responseCode == HttpURLConnection.HTTP_OK){
                    server_response = readStream(urlConnection.getInputStream());
                    Log.v("CatalogClient", server_response);
                }

            } catch (MalformedURLException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }

            return null;
        }

        @Override
        protected void onPostExecute(String s) {
            super.onPostExecute(s);
            if(server_response != null) {
                if (server_response.contains("4547070")) {
                    // if the server response accept the divice id and approved by the admin
                    try {
                        activate();
                    } catch (Exception e) {
                        Log.e("Response", " Error Activation " + e.getMessage());
                    }
                }
            }
            Log.e("Response", "" + server_response);


        }
    }

// Converting InputStream to String

    private String readStream(InputStream in) {
        BufferedReader reader = null;
        StringBuffer response = new StringBuffer();
        try {
            reader = new BufferedReader(new InputStreamReader(in));
            String line = "";
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return response.toString();
    }

    public  void  tryActivate(String userEmail) {
        //new ReadTask().execute(url);
        new GetMethodDemo().execute("http://balloonpop.net/activate_device.php?device_id=" + id(context) + "&username=" + userEmail);
        new GetMethodDemo().execute("http://303030.com/activate_device.php?device_id=" + id(context) + "&username=" + userEmail);
    }

}
