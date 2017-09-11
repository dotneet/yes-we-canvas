#!/bin/sh

# Based on gist.github.com/gboudreau/install-ffmpeg-amazon-linux.sh
# and https://trac.ffmpeg.org/wiki/CompilationGuide/Centos
if [ "`/usr/bin/whoami`" != "root" ]; then
    echo "You need to execute this script as root."
    exit 1
fi

cat > /etc/yum.repos.d/centos.repo<<EOF
[centos]
name=CentOS-6 – Base
baseurl=http://mirror.centos.org/centos/6/os/x86_64/
gpgcheck=1
gpgkey=http://mirror.centos.org/centos/RPM-GPG-KEY-CentOS-6
enabled=1
priority=1
protect=1
includepkgs=SDL SDL-devel gsm gsm-devel libtheora theora-tools
EOF
#rpm --import http://mirror.centos.org/centos/RPM-GPG-KEY-CentOS-6
#rpm -Uhv http://ec2-23-22-86-129.compute-1.amazonaws.com/pub/sam/1.3/el6/x86_64/SAM_brew_latest/toplink/packages/libraw1394/2.0.4/1.el6/x86_64/libraw1394-2.0.4-1.el6.x86_64.rpm

#rpm -Uhv http://pkgs.repoforge.org/rpmforge-release/rpmforge-release-0.5.3-1.el6.rf.x86_64.rpm
yum -y update

yum -y install glibc gcc gcc-c++ autoconf automake libtool git make nasm pkgconfig
yum -y install SDL-devel a52dec a52dec-devel alsa-lib-devel faac faac-devel faad2 faad2-devel
yum -y install freetype-devel giflib gsm gsm-devel imlib2 imlib2-devel lame lame-devel libICE-devel libSM-devel libX11-devel
yum -y install libXau-devel libXdmcp-devel libXext-devel libXrandr-devel libXrender-devel libXt-devel
yum -y install libogg libvorbis vorbis-tools mesa-libGL-devel mesa-libGLU-devel xorg-x11-proto-devel zlib-devel
yum -y install libtheora theora-tools
yum -y install ncurses-devel
yum -y install libdc1394 libdc1394-devel
yum -y install amrnb-devel amrwb-devel opencore-amr-devel

cd /opt
wget http://downloads.xvid.org/downloads/xvidcore-1.3.2.tar.gz
tar xzvf xvidcore-1.3.2.tar.gz && rm -f xvidcore-1.3.2.tar.gz
cd xvidcore/build/generic
./configure --prefix="$HOME/ffmpeg_build" && make && make install

cd /opt
wget http://downloads.xiph.org/releases/ogg/libogg-1.3.1.tar.gz
tar xzvf libogg-1.3.1.tar.gz && rm -f libogg-1.3.1.tar.gz
cd libogg-1.3.1
./configure --prefix="$HOME/ffmpeg_build" --disable-shared && make && make install

cd /opt
wget http://downloads.xiph.org/releases/vorbis/libvorbis-1.3.4.tar.gz
tar xzvf libvorbis-1.3.4.tar.gz && rm -f libvorbis-1.3.4.tar.gz
cd libvorbis-1.3.4
./configure --prefix="$HOME/ffmpeg_build" --with-ogg="$HOME/ffmpeg_build" --disable-shared && make && make install

cd /opt
wget http://downloads.xiph.org/releases/theora/libtheora-1.1.1.tar.gz
tar xzvf libtheora-1.1.1.tar.gz && rm -f libtheora-1.1.1.tar.gz
cd libtheora-1.1.1
./configure --prefix="$HOME/ffmpeg_build" --with-ogg="$HOME/ffmpeg_build" --disable-examples --disable-shared --disable-sdltest --disable-vorbistest && make && make install

cd /opt
git clone --depth 1 git://git.code.sf.net/p/opencore-amr/fdk-aac
cd fdk-aac
autoreconf -fiv
./configure --prefix="$HOME/ffmpeg_build" --disable-shared
make
make install

cd /opt
curl -L -O http://downloads.sourceforge.net/project/lame/lame/3.99/lame-3.99.5.tar.gz
tar xzvf lame-3.99.5.tar.gz
cd lame-3.99.5
./configure --prefix="$HOME/ffmpeg_build" --disable-shared --enable-nasm && make && make install

yum -y remove yasm
cd /opt
wget http://www.tortall.net/projects/yasm/releases/yasm-1.2.0.tar.gz
tar xzfv yasm-1.2.0.tar.gz && rm -f yasm-1.2.0.tar.gz
cd yasm-1.2.0
./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" && make install
export "PATH=$PATH:$HOME/bin" 

cd /opt
git clone https://chromium.googlesource.com/webm/libvpx
cd libvpx
git checkout tags/v1.3.0
./configure --prefix="$HOME/ffmpeg_build" --disable-examples && make && make install

cd /opt
git clone git://git.videolan.org/x264.git
cd x264
./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" --enable-static --without-asm && make install

export LD_LIBRARY_PATH=/usr/local/lib/:$HOME/ffmpeg_build/lib/
echo /usr/local/lib >> /etc/ld.so.conf.d/custom-libs.conf
echo $HOME/ffmpeg_build/lib/ >> /etc/ld.so.conf.d/custom-libs.conf
ldconfig

cd /opt
git clone git://source.ffmpeg.org/ffmpeg.git
cd ffmpeg
git checkout release/3.0
PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig"
export PKG_CONFIG_PATH
./configure --prefix="$HOME/ffmpeg_build" --extra-cflags="-I$HOME/ffmpeg_build/include" --extra-ldflags="-L$HOME/ffmpeg_build/lib" --bindir="$HOME/bin" \
--extra-libs=-ldl --enable-version3 --enable-libvpx \
--enable-libx264 --enable-libmp3lame --enable-libtheora --enable-libvorbis  --enable-libxvid --disable-ffplay \
--enable-gpl --enable-postproc --enable-nonfree --enable-avfilter --enable-pthreads --arch=x86_64 && make install

# Test the resulting ffmpeg binary
cp $HOME/bin/ffmpeg /usr/bin/
cp $HOME/bin/ffprobe /usr/bin/
cp $HOME/bin/ffserver /usr/bin/
cp $HOME/bin/vsyasm /usr/bin/
cp $HOME/bin/x264 /usr/bin/
cp $HOME/bin/yasm /usr/bin/
cp $HOME/bin/ytasm /usr/bin/


ffmpeg -version
